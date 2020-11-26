import "./App.css";
import "antd/dist/antd.css";
import { Layout, Menu, Table, notification, PageHeader } from "antd";
import { useState, useEffect } from "react";
import useWindowDimensions from "./useWindowDimensions";

const { Header, Content } = Layout;
const { Column } = Table;

const App = () => {
    const [category, setCategory] = useState("jackets");
    const [productData, setProductData] = useState([]);
    const [availabilityData, setAvailabilityData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);

    const manufacturers = ["abiplos", "derp", "nouke", "reps", "xoon"];

    /* Fetches all data for product availability on component mount and sets it to state. When data is received, ends loading spinner.
    If there is an error in one of the API requests (empty array), sets the fetchError state, which fires the hook again to re-fetch. */
    useEffect(() => {
        allManufacturersData()
            .then((data) => {
                setAvailabilityData(data.flat());
                setIsLoading(false);
            })
            .catch((reason) => {
                console.log(reason);
                console.log("Refetching data");
                setFetchError(!fetchError);
            });
    }, [fetchError]);

    //Fetches new product data when the category tab is changed.
    useEffect(() => {
        getProductData(category);
    }, [category]);

    //Gets the product details data for a given category that is shown on the table.
    const getProductData = async (category) => {
        var res = await fetch("https://bad-api-assignment.reaktor.com/products/" + category);
        var data = await res.json();
        setProductData(data);
    };

    /* Returns a promise that is later included in a Promise.all() function involving all 5 API calls for different manufacturers. 
        Checks response header "content-length" for the error case, where the response just contains an empty array.*/
    const oneManufacturerData = (manufacturer) => {
        return new Promise((resolve, reject) => {
            fetch("https://bad-api-assignment.reaktor.com/availability/" + manufacturer)
                .then((res) => {
                    for (var pair of res.headers.entries()) {
                        if (pair[0] === "content-length") {
                            if (pair[1] < 1000) {
                                console.log("Sneaky error");
                                reject("Error ruined everything.");
                            }
                        }
                    }
                    return res.json();
                })
                .then((result) => {
                    resolve(result.response);
                });
        });
    };

    /* Goes through each manufacturer and gathers promises for all 5 API calls into Promise.all() */
    const allManufacturersData = async () => {
        let allRequests = [];

        for (let i = 0; i < manufacturers.length; i++) {
            allRequests.push(oneManufacturerData(manufacturers[i]));
        }

        let promiseAll = await Promise.all(allRequests);

        return promiseAll;
    };

    /* Finds and parses the corresponding availability data for a given product ID. Then opens a notification pop-up showing that data */
    const openNotification = (productId) => {
        var arr = availabilityData;
        var slicedStr = "";

        for (let i = 0; i < arr.length; i++) {
            var id = arr[i].id.toLowerCase();
            if (id === productId) {
                var str = arr[i].DATAPAYLOAD;
                slicedStr = str.slice(31, str.length - 31);
                break;
            }
        }

        var icon;
        if (slicedStr === "INSTOCK") {
            icon = "success";
            slicedStr = "In stock";
        } else if (slicedStr === "LESSTHAN10") {
            icon = "warning";
            slicedStr = "Less than 10";
        } else if (slicedStr === "OUTOFSTOCK") {
            icon = "error";
            slicedStr = "Out of stock";
        } else {
            icon = "info";
            slicedStr = "Something went wrong!";
        }

        notification[icon]({
            message: slicedStr,
        });
    };

    const { height, width } = useWindowDimensions();
    let expandableConfig = {};
    let scrollConfig = {};

    //Binds color and price columns to variables so they an be toggled off and shown in expanded row when the screen gets small enough.
    let colorColumn = <Column title="Color" dataIndex="color" key="color"></Column>;
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
                    <Menu.Item key="1" onClick={() => setCategory("jackets")}>
                        Jackets
                    </Menu.Item>
                    <Menu.Item key="2" onClick={() => setCategory("shirts")}>
                        Shirts
                    </Menu.Item>
                    <Menu.Item key="3" onClick={() => setCategory("accessories")}>
                        Accessories
                    </Menu.Item>
                </Menu>
            </Header>
            <Content className="content">
                <PageHeader title="See product availability by clicking the ID"></PageHeader>
                <Table
                    dataSource={productData}
                    rowKey="id"
                    pagination={{ position: ["bottomCenter"] }}
                    loading={isLoading}
                    expandable={expandableConfig}
                    scroll={scrollConfig}
                >
                    <Column
                        title="ID"
                        dataIndex="id"
                        key="id"
                        render={(text) => <a onClick={() => openNotification(text)}>{text}</a>}
                    ></Column>
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
                    {colorColumn}
                    {priceColumn}
                </Table>
            </Content>
        </Layout>
    );
};

export default App;
