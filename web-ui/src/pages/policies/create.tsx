import { Create, useForm, useSelect } from "@refinedev/antd";
import MDEditor from "@uiw/react-md-editor";
import { Form, Input, Select } from "antd";

export const PolicyCreate = () => {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Create saveButtonProps={saveButtonProps}>
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
          <Input />
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
          <MDEditor data-color-mode="light" />
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
    </Create>
  );
};
