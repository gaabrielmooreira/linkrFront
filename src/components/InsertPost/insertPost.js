import { useContext, useState } from "react";
import { AuthContext } from "../../context/auth";
import apiPosts from "../../services/apiPosts";
import {
  Button,
  Container,
  InputDescription,
  InputUrl,
  LeftContainer,
  RightContainer,
} from "./styled";

export default function InsertPost({postsAreChanged,setPostsAreChanged}) {
  const { userAuth } = useContext(AuthContext);
  const [disabled, setDisabled] = useState(false);
  const [postInfo, setPostInfo] = useState({
    url: "",
    description: "",
  });

  const { url, description } = postInfo;

  async function onPublish(e) {
    e.preventDefault();

    if (url === "") {
      return alert("link is required!");
    }
    setDisabled(true);

    try {
      await apiPosts.insertPost( description, url, userAuth.token);
      setPostInfo({ url: "", description: "" });
      setPostsAreChanged(!postsAreChanged)
      setDisabled(false);
    } catch (error) {
      console.log(error.message);
      setDisabled(false);
      alert("There was an error publishing your link");
    }
  }

  return (
    <Container data-test="publish-box">
      <LeftContainer>
        <img src={userAuth.url} alt="perfil" />
      </LeftContainer>
      <RightContainer onSubmit={onPublish}>
        <h2>What are you going to share today?</h2>
        <InputUrl
          placeholder="http://..."
          type="url"
          value={url}
          onChange={(e) => setPostInfo({ ...postInfo, url: e.target.value })}
          disabled={disabled}
          data-test="link"
        />
        <InputDescription
          placeholder="Awesome article about..."
          type="text"
          value={description}
          onChange={(e) =>
            setPostInfo({ ...postInfo, description: e.target.value })
          }
          disabled={disabled}
          data-test="description" 
        />
        <Button>
          <button type="submit" disabled={disabled} data-test="publish-btn" >
          {!disabled? "Publish" : "Publishing..." }
          </button>
        </Button>
      </RightContainer>
    </Container>
  );
}
