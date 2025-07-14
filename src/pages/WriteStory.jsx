import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Upload,
  Card,
  Row,
  Col,
  Typography,
  Space,
  message,
  Divider,
  Tag,
  Flex,
} from "antd";
import {
  PlusOutlined,
  SaveOutlined,
  EyeOutlined,
  UploadOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { storiesAPI } from "../services/api";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const WriteStory = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [coverUrl, setCoverUrl] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const storyTags = [
    "học đường",
    "lãng mạn",
    "hành động",
    "viễn tưởng",
    "kinh dị",
    "hài hước",
    "phiêu lưu",
    "drama",
    "khoa học",
    "huyền bí",
  ];

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const storyData = {
        ...values,
        cover: coverUrl,
        tags: values.tags || [],
      };

      const response = await storiesAPI.create(storyData);

      if (response.data.success) {
        message.success("Tạo truyện thành công!");
        navigate(`/story/${response.data.data.story.slug}`);
      }
    } catch (error) {
      console.error("Create story error:", error);
      message.error(
        error.response?.data?.message ||
          "Tạo truyện thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    form
      .validateFields()
      .then((values) => {
        setFormData({ ...values, cover: coverUrl });
        setPreviewMode(true);
      })
      .catch(() => {
        message.error("Vui lòng kiểm tra và điền đầy đủ thông tin");
      });
  };

  const handleUpload = (info) => {
    if (info.file.status === "done") {
      setCoverUrl(info.file.response.url);
      message.success("Upload ảnh bìa thành công!");
    } else if (info.file.status === "error") {
      message.error("Upload ảnh bìa thất bại!");
    }
  };

  const uploadProps = {
    name: "file",
    action: "/api/upload", // You'll need to implement this endpoint
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    onChange: handleUpload,
    showUploadList: false,
  };

  if (previewMode) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}>
        <Flex
          justify="space-between"
          align="center"
          style={{ marginBottom: "24px" }}
        >
          <Title level={2}>Xem trước truyện</Title>
          <Space>
            <Button onClick={() => setPreviewMode(false)}>
              Quay lại chỉnh sửa
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={loading}
              icon={<SaveOutlined />}
            >
              Tạo truyện
            </Button>
          </Space>
        </Flex>

        <Card>
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Flex justify="center">
                <img
                  src={
                    formData.cover ||
                    "https://via.placeholder.com/300x400?text=No+Image"
                  }
                  alt={formData.title}
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    height: "320px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
              </Flex>
            </Col>
            <Col xs={24} md={16}>
              <Title level={3}>{formData.title}</Title>
              <Paragraph>
                <Text strong>Tác giả:</Text> {formData.author}
              </Paragraph>
              {formData.translator && (
                <Paragraph>
                  <Text strong>Dịch giả:</Text> {formData.translator}
                </Paragraph>
              )}
              <Paragraph>
                <Text strong>Trạng thái:</Text>{" "}
                <Tag color={formData.status === "ongoing" ? "blue" : "green"}>
                  {formData.status === "ongoing" ? "Đang ra" : "Hoàn thành"}
                </Tag>
              </Paragraph>
              {formData.tags && formData.tags.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <Text strong>Thể loại:</Text>
                  <div style={{ marginTop: "8px" }}>
                    {formData.tags.map((tag) => (
                      <Tag key={tag} style={{ marginBottom: "4px" }}>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
              <Paragraph>
                <Text strong>Mô tả:</Text>
              </Paragraph>
              <Paragraph>{formData.description}</Paragraph>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}>
      <Flex
        vertical
        align="center"
        style={{ textAlign: "center", marginBottom: "32px" }}
      >
        <BookOutlined
          style={{ fontSize: "48px", color: "#1890ff", marginBottom: "16px" }}
        />
        <Title level={2}>Tạo truyện mới</Title>
        <Text type="secondary">
          Chia sẻ câu chuyện của bạn với cộng đồng độc giả
        </Text>
      </Flex>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Row gutter={24}>
            <Col xs={24} md={16}>
              <Form.Item
                name="title"
                label="Tên truyện"
                rules={[
                  { required: true, message: "Vui lòng nhập tên truyện" },
                  { max: 200, message: "Tên truyện không được quá 200 ký tự" },
                ]}
              >
                <Input placeholder="Nhập tên truyện..." size="large" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="author"
                    label="Tác giả"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên tác giả" },
                      {
                        max: 100,
                        message: "Tên tác giả không được quá 100 ký tự",
                      },
                    ]}
                  >
                    <Input placeholder="Tên tác giả..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="translator"
                    label="Dịch giả (không bắt buộc)"
                    rules={[
                      {
                        max: 100,
                        message: "Tên dịch giả không được quá 100 ký tự",
                      },
                    ]}
                  >
                    <Input placeholder="Tên dịch giả..." />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="Mô tả truyện"
                rules={[
                  { required: true, message: "Vui lòng nhập mô tả truyện" },
                  { max: 2000, message: "Mô tả không được quá 2000 ký tự" },
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="Mô tả nội dung, cốt truyện của truyện..."
                  showCount
                  maxLength={2000}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="tags" label="Thể loại">
                    <Select
                      mode="multiple"
                      placeholder="Chọn thể loại truyện..."
                      maxTagCount={5}
                    >
                      {storyTags.map((tag) => (
                        <Option key={tag} value={tag}>
                          {tag}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="status"
                    label="Trạng thái"
                    initialValue="ongoing"
                  >
                    <Select>
                      <Option value="ongoing">Đang ra</Option>
                      <Option value="completed">Hoàn thành</Option>
                      <Option value="paused">Tạm ngưng</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Ảnh bìa">
                <Flex justify="center">
                  <Card
                    style={{
                      border: "2px dashed #d9d9d9",
                      borderRadius: "8px",
                      padding: "24px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "border-color 0.3s",
                    }}
                    hoverable
                    bodyStyle={{ padding: 0 }}
                  >
                    {coverUrl ? (
                      <div style={{ position: "relative" }}>
                        <img
                          src={coverUrl}
                          alt="Cover preview"
                          style={{
                            width: "100%",
                            maxWidth: "200px",
                            height: "256px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            marginBottom: "16px",
                          }}
                        />
                        <Button
                          size="small"
                          onClick={() => setCoverUrl("")}
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    ) : (
                      <Flex vertical align="center">
                        <UploadOutlined
                          style={{
                            fontSize: "48px",
                            color: "#999",
                            marginBottom: "8px",
                          }}
                        />
                        <div style={{ color: "#666", marginBottom: "8px" }}>
                          Tải lên ảnh bìa
                        </div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          JPG, PNG (tối đa 5MB)
                        </Text>
                      </Flex>
                    )}
                  </Card>
                </Flex>

                <Flex justify="center" style={{ marginTop: "16px" }}>
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>
                      {coverUrl ? "Thay đổi ảnh" : "Chọn ảnh"}
                    </Button>
                  </Upload>
                </Flex>

                <div style={{ marginTop: "16px" }}>
                  <Input
                    placeholder="Hoặc nhập URL ảnh..."
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                  />
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Flex justify="center">
            <Space size="middle">
              <Button
                size="large"
                onClick={handlePreview}
                icon={<EyeOutlined />}
              >
                Xem trước
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                icon={<SaveOutlined />}
              >
                Tạo truyện
              </Button>
            </Space>
          </Flex>
        </Form>
      </Card>

      <Flex justify="center" style={{ marginTop: "24px" }}>
        <Text
          type="secondary"
          style={{ fontSize: "14px", textAlign: "center" }}
        >
          Bằng việc tạo truyện, bạn đồng ý với{" "}
          <a href="/terms" style={{ color: "#1890ff" }}>
            Điều khoản sử dụng
          </a>{" "}
          và{" "}
          <a href="/guidelines" style={{ color: "#1890ff" }}>
            Quy định cộng đồng
          </a>
        </Text>
      </Flex>
    </div>
  );
};

export default WriteStory;
