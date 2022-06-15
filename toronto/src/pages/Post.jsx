import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import Upload from '@/components/molecules/Upload';
import DraggableArea from '@/components/molecules/Upload/UploadArea';
import axios from 'axios';

const Post = () => {
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    agree: '',
    disagree: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { title, content, agree, disagree, image } = postData;

  const handleClick = (e) => {
    const formData = new FormData();
    const titleData = {
      title,
      content,
      agree,
      disagree,
    };
    formData.append('title', JSON.stringify(titleData));
    formData.append('image', image);
    formData.append('channelId', '629f0b8ed648c11b1bd9d300');

    setLoading(true);
    axios({
      url: `${process.env.REACT_APP_END_POINT}/posts/create`,
      method: 'post',
      headers: {
        Authorization: `bearer ${process.env.REACT_APP_USER_TOKEN}`,
      },
      data: formData,
    })
      .then((res) => {
        if (res.status === 200) {
          navigate('/'); // 글쓰기가 성공하면 지정한 페이지로 이동
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPostData({
      ...postData,
      [name]: value,
    });
  };

  const handleFileChange = (file) => {
    setPostData({
      ...postData,
      image: file,
    });
  };

  return (
    <Card padding={20}>
      <Wrapper>
        <Input
          block
          name='title'
          value={title}
          onChange={handleChange}
          placeholder='제목'
        />
        <Upload droppable name='image' onChange={handleFileChange}>
          {(file, dragging, handleChooseFile) => (
            <DraggableArea
              file={file}
              onClick={handleChooseFile}
              dragging={dragging}
              width={600}
              height={400}
            ></DraggableArea>
          )}
        </Upload>
        <Input
          block
          name='content'
          value={content}
          onChange={handleChange}
          placeholder='내용'
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <Input
            name='agree'
            value={agree}
            onChange={handleChange}
            placeholder='찬성'
            wrapperProps={{
              style: { flex: 1 },
            }}
          />
          <Input
            name='disagree'
            value={disagree}
            onChange={handleChange}
            placeholder='반대'
            wrapperProps={{
              style: { flex: 1 },
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            onClick={handleClick}
            disabled={loading ? true : false}
            style={{ marginTop: '10px' }}
          >
            글쓰기
          </Button>
        </div>
      </Wrapper>
    </Card>
  );
};

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
`;

export default Post;