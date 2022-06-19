import { useCallback, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Header, DoughnutChart, Icon } from '@/components/atoms';
import { Vote, InputBar } from '@/components/molecules';
import { CommentList } from '@/components/organisms';
import { getToken } from '@/lib/Login';
import { useUsersState } from '@/contexts/UserContext';

const ResultPage = () => {
  const [data, setData] = useState({
    post: {
      title: '',
    },
    agree: 0,
    disagree: 0,
    comments: [],
    likes: [],
  });
  const [opinion, setOpinion] = useState('');
  const [likeData, setLikeData] = useState({});
  const { postId } = useParams();
  const token = getToken();
  const userData = useUsersState();
  const navigate = useNavigate();

  const getPostData = useCallback(() => {
    axios(`${process.env.REACT_APP_END_POINT}/posts/${postId}`).then((res) => {
      const titleData = JSON.parse(res.data.title);

      setData({
        post: {
          id: res.data._id,
          title: titleData.postTitle,
        },
        comments: res.data.comments,
        likes: res.data.likes,
      });
      setLikeData({
        isLiked:
          res.data.likes.filter(({ user }) => user === userData.user.data?._id)
            .length > 0
            ? true
            : false,
        likeId: res.data.likes.filter(
          ({ user }) => user === userData.user.data?._id,
        )[0]?._id,
      });
    });
  }, [postId, userData]);

  const checkValidPost = useCallback(() => {
    axios(`${process.env.REACT_APP_END_POINT}/posts/${postId}`).then((res) => {
      if (res.data._id !== postId) {
        navigate('/no-matched-post', { replace: true });
      }
    });
  }, [navigate, postId]);

  const deleteComment = (id) => {
    axios(`${process.env.REACT_APP_END_POINT}/comments/delete`, {
      method: 'delete',
      headers: {
        Authorization: `bearer ${token}`,
      },
      data: {
        id,
      },
    }).then(() => getPostData());
  };

  useEffect(() => {
    checkValidPost();
    getPostData();
  }, [getPostData, checkValidPost]);

  const agreeComments = data.comments
    .filter((item) => {
      const type = JSON.parse(item.comment).type;
      return type === 'agree';
    })
    .reverse();

  const disagreeComments = data.comments
    .filter((item) => {
      const type = JSON.parse(item.comment).type;
      return type === 'disagree';
    })
    .reverse();

  const votes = data.comments.filter((item) => {
    const type = JSON.parse(item.comment).type;
    return type === 'vote';
  });

  const agreeVotes = votes.filter((item) => {
    return JSON.parse(item.comment).content === 'agree';
  });

  const disagreeVotes = votes.filter((item) => {
    return JSON.parse(item.comment).content === 'disagree';
  });

  const isLiked =
    data.likes.filter(({ user }) => user === userData.user.data?._id).length > 0
      ? true
      : false;

  const handleChange = (opinionState) => {
    setOpinion(opinionState);
  };

  const handleSubmit = (text) => {
    if (opinion === '') {
      alert('찬성/반대 의견을 선택해주세요.');
      return;
    }
    if (postId && text.trim().length > 2) {
      axios(`${process.env.REACT_APP_END_POINT}/comments/create`, {
        method: 'post',
        headers: {
          Authorization: `bearer ${token}`,
        },
        data: {
          comment: JSON.stringify({
            type: opinion,
            content: text,
          }),
          postId: postId,
        },
      }).then(() => getPostData());
    }
  };

  const handleLikeClick = () => {
    if (likeData.isLiked) {
      if (!likeData.likeId) return;
      // 좋아요 삭제
      axios(`${process.env.REACT_APP_END_POINT}/likes/delete`, {
        method: 'delete',
        headers: {
          Authorization: `bearer ${token}`,
        },
        data: {
          id: likeData.likeId,
        },
      }).then(() => {
        getPostData();
      });
    } else {
      // 좋아요 추가
      axios(`${process.env.REACT_APP_END_POINT}/likes/create`, {
        method: 'post',
        headers: {
          Authorization: `bearer ${token}`,
        },
        data: {
          postId,
        },
      }).then(() => {
        getPostData();
      });
    }
  };

  return (
    <div style={{ backgroundColor: '#efefef' }}>
      <div>
        <Header>{data?.post?.title}</Header>
      </div>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <DoughnutChart
          data={[agreeVotes?.length, disagreeVotes?.length]}
          labels={['찬성', '반대']}
          backgroundColor={[
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 99, 132, 0.2)',
          ]}
          borderColor={['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)']}
          chartSize={500}
        />
        <Vote onChange={handleChange} agreeText='찬성' disagreeText='반대' />
        <div
          style={{
            width: '100%',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <InputBar
            totalWidth={500}
            placeholder='댓글을 작성해주세요.'
            buttonText='댓글 작성'
            onSubmit={handleSubmit}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100px',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div onClick={handleLikeClick} style={{ cursor: 'pointer' }}>
              <Icon fill={isLiked ? 'blue' : undefined} iconName='thumbs-up' />
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          gap: '20px',
          marginTop: '20px',
        }}
      >
        <div style={{ flex: 1 }}>
          <CommentList
            name='찬성 댓글'
            width={'calc(100% - 20px)'}
            limit={5}
            comments={agreeComments}
            onDelete={deleteComment}
          />
        </div>
        <div style={{ flex: 1 }}>
          <CommentList
            name='반대 댓글'
            width='calc(100% - 20px)'
            limit={5}
            comments={disagreeComments}
            onDelete={deleteComment}
          />
        </div>
      </div>
    </div>
  );
};

export default ResultPage;