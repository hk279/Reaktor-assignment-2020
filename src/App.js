import "./App.css";
import axios from "axios";
import "antd/dist/antd.css";
import { Layout, Menu, Table, Typography } from "antd";
import { useState, useEffect } from "react";
import useWindowDimensions from "./useWindowDimensions";

const { Header, Content } = Layout;
const { Column } = Table;
const { Title } = Typography;

const App = () => {
    const [category, setCategory] = useState("gloves");
    const [productData, setProductData] = useState([]);
    const [availabilityData, setAvailabilityData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    //Fetches new product data when the category tab is changed.
    useEffect(() => {
        getProductData(category);
    }, [category]);

    /* Fetches all data for product availability on component mount and sets it to state. */
    useEffect(() => {
        getAvailabilityData();
    }, []);

    //Gets the product details data for a given category that is shown on the table.
    const getProductData = (category) => {
        axios
            /* .get("http://localhost:3001/api/products/" + category) */
            .get("/api/products/" + category)
            .then((res) => setProductData(res.data))
            .catch((err) => console.log(err));
    };

    // Gets availability data for all manufacturers.
    const getAvailabilityData = () => {
        axios
            /* .get("http://localhost:3001/api/availability") */
            .get("/api/availability")
            .then((res) => {
                setAvailabilityData(res.data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    /* Finds availbility data for an item with corresponding id and returns a formatted string. */
    const getItemAvailability = (id) => {
        let slicedString;
        let formattedString;

        availabilityData.forEach((item) => {
            if (id === item.id.toLowerCase()) {
                const str = item.DATAPAYLOAD;
                slicedString = str.slice(50, str.length - 31);
                if (slicedString === "INSTOCK") {
                    formattedString = "In stock";
                } else if (slicedString === "LESSTHAN10") {
                    formattedString = "Less than 10";
                } else if (slicedString === "OUTOFSTOCK") {
                    formattedString = "Out of stock";
                } else {
                    formattedString = slicedString;
                }
            }
        });

        return formattedString;
    };

    const { height, width } = useWindowDimensions();
    let expandableConfig = {};
    let scrollConfig = {};

    //Binds color and price columns to variables so they an be toggled off and shown in expanded row when the screen gets small enough.
    let colorColumn = (
        <Column
            title="Color"
            dataIndex="color"
            key="color"
            render={(color) => (
                <>
                    {color.map((item, i) => (
                        <p className="color" key={i}>
                            {item}
                        </p>
                    ))}
                </>
            )}
        ></Column>
    );
    let priceColumn = <Column title="Price" dataIndex="price" key="price"></Column>;

    //Color and price moved to the expanded row when screen width is less than 700px
    if (width < 700) {
        colorColumn = null;
        priceColumn = null;
        expandableConfig = {
            expandedRowRender: (record) => (
                <div className="expandedRow">
                    <p className="expandedRowCell">
                        <b>Color:</b>
                    </p>
                    <p className="expandedRowCell">{record.color}</p>
                    <p className="expandedRowCell">
                        <b>Price:</b>
                    </p>
                    <p className="expandedRowCell">{record.price}</p>
                </div>
            ),
        };
    }

    //Adjusting the scrollable area according to the screen size.
    if (height < 500) {
        scrollConfig = { y: 200, scrollToFirstRowOnChange: true };
    } else if (height < 600) {
        scrollConfig = { y: 300, scrollToFirstRowOnChange: true };
    } else if (height < 700) {
        scrollConfig = { y: 350, scrollToFirstRowOnChange: true };
    } else if (height < 800) {
        scrollConfig = { y: 400, scrollToFirstRowOnChange: true };
    } else if (height < 900) {
        scrollConfig = { y: 450, scrollToFirstRowOnChange: true };
    } else if (height < 1000) {
        scrollConfig = { y: 500, scrollToFirstRowOnChange: true };
    }

    return (
        <Layout>
            <Header>
                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]}>
                    <Menu.Item key="1" onClick={() => setCategory("gloves")}>
                        Gloves
                    </Menu.Item>
                    <Menu.Item key="2" onClick={() => setCategory("facemasks")}>
                        Facemasks
                    </Menu.Item>
                    <Menu.Item key="3" onClick={() => setCategory("beanies")}>
                        Beanies
                    </Menu.Item>
                </Menu>
            </Header>
            <Title className="info" level={4}>
                Availability is refreshed every 5 minutes. Refresh the page for latest data.
            </Title>
            <Content className="content">
                <Table
                    dataSource={productData}
                    rowKey="id"
                    pagination={{ position: ["bottomCenter"] }}
                    loading={isLoading}
                    expandable={expandableConfig}
                    scroll={scrollConfig}
                >
                    <Column title="ID" dataIndex="id" key="id"></Column>
                    <Column
                        title="Name"
                        dataIndex="name"
                        key="name"
                        sorter={(a, b) => a.name.localeCompare(b.name)}
                        defaultFilteredValue={true}
                        defaultSortOrder="ascend"
                    ></Column>
                    <Column
                        title="Manufacturer"
                        dataIndex="manufacturer"
                        key="manufacturer"
                        sorter={(a, b) => a.manufacturer.localeCompare(b.manufacturer)}
                    ></Column>
                    <Column
                        title="Availability"
                        key="availability"
                        render={(record) => <p className="availability">{getItemAvailability(record.id)}</p>}
                    ></Column>
                    {colorColumn}
                    {priceColumn}
                </Table>
            </Content>
        </Layout>
    );
};

export default App;
