import {Edit, useForm} from "@refinedev/antd";
import MDEditor from "@uiw/react-md-editor";
import {Form, Input} from "antd";

export const PolicyEdit = () => {
    const {formProps, saveButtonProps, queryResult, formLoading} = useForm({
        meta: {
            select: "*",
        },
    });

    const policyData = queryResult?.data?.data;

    return (
        <Edit saveButtonProps={saveButtonProps} isLoading={formLoading}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label={"Name"}
                    name={["name"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    label={"Description"}
                    name="description"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <MDEditor data-color-mode="light"/>
                </Form.Item>
                <Form.Item
                    label={"Rego Code"}
                    name={["rego_code"]}
                    initialValue={`package polism

info contains msg if {
    // msg := "Hello, world!"
}`}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input.TextArea rows={15}/>
                </Form.Item>
            </Form>
        </Edit>
    );
};
