import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  message,
  Divider,
  Spin,
  Alert,
  BackTop,
  Flex,
} from "antd";
import {
  SaveOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams, Link } from "react-router-dom";
import { storiesAPI, chaptersAPI } from "../services/api";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const WriteChapter = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [storyLoading, setStoryLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [story, setStory] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { storyId } = useParams();

  useEffect(() => {
    const fetchStory = async () => {
      try {
        setStoryLoading(true);
        const response = await storiesAPI.getBySlug(storyId);
        if (response.data.success) {
          setStory(response.data.data.story);
        } else {
          throw new Error("Không tìm thấy truyện");
        }
      } catch (error) {
        console.error("Fetch story error:", error);
        setError("Không thể tải thông tin truyện");
      } finally {
        setStoryLoading(false);
      }
    };

    if (storyId) {
      fetchStory();
    }
  }, [storyId]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const chapterData = {
        ...values,
        storyId: story._id,
        number: story.chapterCount + 1, // Auto-increment chapter number
      };

      const response = await chaptersAPI.create(chapterData);

      if (response.data.success) {
        message.success("Tạo chương mới thành công!");
        navigate(`/story/${story.slug}`, {
          state: { from: "write-chapter" },
        });
      }
    } catch (error) {
      console.error("Create chapter error:", error);
      message.error(
        error.response?.data?.message ||
          "Tạo chương thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    form
      .validateFields()
      .then((values) => {
        setFormData(values);
        setPreviewMode(true);
      })
      .catch(() => {
        message.error("Vui lòng kiểm tra và điền đầy đủ thông tin");
      });
  };

  const handleSaveDraft = async (values) => {
    try {
      setLoading(true);

      const draftData = {
        ...values,
        storyId: story._id,
        number: story.chapterCount + 1,
        status: "draft",
      };

      const response = await chaptersAPI.create(draftData);

      if (response.data.success) {
        message.success("Lưu bản nháp thành công!");
        navigate(`/story/${story.slug}`, {
          state: { from: "write-chapter" },
        });
      }
    } catch (error) {
      console.error("Save draft error:", error);
      message.error("Lưu bản nháp thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (storyLoading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: "100vh" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (error || !story) {
    return (
      <Flex
        justify="center"
        align="center"
        style={{ minHeight: "100vh", padding: "24px" }}
      >
        <Space
          direction="vertical"
          size="large"
          style={{ textAlign: "center", maxWidth: 400 }}
        >
          <Alert
            message="Lỗi tải truyện"
            description={error || "Không tìm thấy truyện"}
            type="error"
            showIcon
          />
          <Link to="/">
            <Button type="primary" size="large">
              Về trang chủ
            </Button>
          </Link>
        </Space>
      </Flex>
    );
  }

  if (previewMode) {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>
        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={16}
          style={{ marginBottom: 24 }}
        >
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Xem trước chương
            </Title>
            <Text type="secondary">
              {story.title} - Chương {story.chapterCount + 1}
            </Text>
          </div>
          <Space wrap>
            <Button onClick={() => setPreviewMode(false)}>
              Quay lại chỉnh sửa
            </Button>
            <Button onClick={() => handleSaveDraft(formData)} loading={loading}>
              Lưu bản nháp
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={loading}
              icon={<SaveOutlined />}
            >
              Đăng chương
            </Button>
          </Space>
        </Flex>

        <Card>
          <div>
            <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
              Chương {story.chapterCount + 1}: {formData.title}
            </Title>

            <div style={{ marginBottom: 24, textAlign: "center" }}>
              <Text type="secondary">
                Truyện: <Link to={`/story/${story.slug}`}>{story.title}</Link>
              </Text>
              <br />
              <Text type="secondary">Tác giả: {story.author}</Text>
            </div>

            <Divider />

            <div
              style={{
                fontSize: "16px",
                lineHeight: "1.8",
                whiteSpace: "pre-wrap",
                maxWidth: "none",
                textAlign: "justify",
              }}
            >
              {formData.content}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>
      <Flex align="center" wrap="wrap" gap={16} style={{ marginBottom: 24 }}>
        <Link to={`/story/${story.slug}`}>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            style={{ paddingLeft: 0 }}
          >
            Quay lại truyện
          </Button>
        </Link>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Viết chương mới
          </Title>
          <Text type="secondary">
            {story.title} - Chương {story.chapterCount + 1}
          </Text>
        </div>
      </Flex>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="title"
            label="Tiêu đề chương"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề chương" },
              { max: 200, message: "Tiêu đề chương không được quá 200 ký tự" },
            ]}
          >
            <Input
              placeholder={`Nhập tiêu đề cho chương ${
                story.chapterCount + 1
              }...`}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung chương"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung chương" },
              {
                min: 100,
                message: "Nội dung chương phải có ít nhất 100 ký tự",
              },
            ]}
            extra="Gõ nội dung chương của bạn. Hỗ trợ xuống dòng và định dạng cơ bản."
          >
            <TextArea
              rows={20}
              placeholder="Nhập nội dung chương..."
              showCount
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                fontFamily: "Georgia, serif",
              }}
            />
          </Form.Item>

          <Card
            title={<Text strong>💡 Gợi ý viết chương hay</Text>}
            size="small"
            style={{
              marginBottom: 24,
              background: "var(--background-color-light)",
              border: "1px solid var(--border-color)",
              borderLeft: "4px solid var(--primary-color)",
              boxShadow: "0 2px 8px rgba(24, 144, 255, 0.1)",
            }}
          >
            <ul
              style={{
                margin: 0,
                paddingLeft: 20,
                fontSize: 14,
                lineHeight: "1.6",
                color: "var(--text-color-secondary)",
              }}
            >
              <li>
                Bắt đầu chương với một tình huống hấp dẫn hoặc cliffhanger
              </li>
              <li>
                Duy trì nhịp độ phù hợp, xen kẽ giữa action và tâm lý nhân vật
              </li>
              <li>
                Kết thúc chương bằng một twist hoặc câu hỏi để giữ chân độc giả
              </li>
              <li>Sử dụng đối thoại để làm sinh động câu chuyện</li>
              <li>Kiểm tra chính tả và ngữ pháp trước khi đăng</li>
            </ul>
          </Card>

          <Divider />

          <Flex justify="center" wrap="wrap" gap={16}>
            <Button size="large" onClick={handlePreview} icon={<EyeOutlined />}>
              Xem trước
            </Button>
            <Button
              size="large"
              onClick={() => {
                form
                  .validateFields()
                  .then((values) => {
                    handleSaveDraft(values);
                  })
                  .catch(() => {
                    message.error("Vui lòng kiểm tra thông tin");
                  });
              }}
              icon={<SaveOutlined />}
              loading={loading}
            >
              Lưu nháp
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={loading}
              icon={<SendOutlined />}
            >
              Đăng chương
            </Button>
          </Flex>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Sau khi đăng, bạn có thể{" "}
              <Link to="/terms" style={{ color: "#1890ff" }}>
                chỉnh sửa chương
              </Link>{" "}
              hoặc xem trong{" "}
              <Link to="/guidelines" style={{ color: "#1890ff" }}>
                danh sách chương
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default WriteChapter;
