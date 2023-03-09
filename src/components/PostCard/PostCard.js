import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/auth";
import apiPosts from "../../services/apiPosts";
import DeleteButton from "../DeleteButton/DeleteButton";
import { EditIcon, Heart, HeartTransparent, LeftContainer, Post, RightContainer, RightTopContainer } from "./Styled";
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

export default function PostCard({ post, postsAreChanged, setPostsAreChanged }) {
    const { id, post_author_id, post_author, photo_author, post_description, post_link, liked_by, user_liked, likes_count } = post;
    const { userAuth } = useContext(AuthContext);

    const [isLiked, setIsLiked] = useState(user_liked);
    const [likesPost, setLikesPost] = useState(likes_count);
    const [likesDescription, setLikesDescription] = useState("");
    
    const [description, setDescription] = useState(post_description);
    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmingEdit, setIsConfirmingEdit] = useState(false);
    const [descriptionInput, setDescriptionInput] = useState(description);
    const inputRef = useRef(null);


    // Like 
    const handleLike = async () => {
        try {
            await apiPosts.toggleLike(id, userAuth.token);
            if (isLiked) {
                const newLikesPost = Number(likesPost) - 1;
                setLikesPost(newLikesPost);
            } else {
                const newLikesPost = Number(likesPost) + 1;
                setLikesPost(newLikesPost);
            }
            setIsLiked(!isLiked);
        } catch (error) {
            console.log(error);
        }

    }
    useEffect(() => {
        function toolTipDescription(){
            if (!likesPost) return setLikesDescription("Não existem curtidas ainda!");
            if (!isLiked) {
                if (liked_by && liked_by.length === 1) return setLikesDescription(`${liked_by[0]}`);
                if (liked_by && liked_by.length === 2) return setLikesDescription(`${liked_by[0]} e ${liked_by[1]}`);
                if (liked_by && liked_by.length > 2) return setLikesDescription(`${liked_by[0]}, ${liked_by[1]} e outras ${likesPost - 2} pessoas`);
            } else {
                if (liked_by === null) return setLikesDescription(`Você`);
                if (liked_by.length === 1) return setLikesDescription(`Você e ${liked_by[0]}`);
                if (liked_by.length > 1) return setLikesDescription(`Você, ${liked_by[0]} e outras ${likesPost - 2} pessoas`);
            }
        }
        toolTipDescription();
    },[isLiked]);


    
    // Edit 
    useEffect(() => {
        if (isEditing) inputRef.current.focus();
    }, [isEditing]);

    const openEdit = () => {
        setIsEditing(true);
    }

    const cancelEdit = () => {
        setDescriptionInput(description);
        setIsEditing(false);
    }

    const handleKeyDown = async (event) => {
        if (event.key === 'Enter') {
            setIsConfirmingEdit(true);
            try {
                await apiPosts.updatePost(id, descriptionInput, userAuth.token);
                setDescription(descriptionInput);
                setIsConfirmingEdit(false);
                setIsEditing(false);
            } catch (error) {
                setIsConfirmingEdit(false);
                alert("Não foi possivel salvar as alterações.");
                console.log(error);
            }
        }
        if (event.key === 'Escape') cancelEdit();
    }

    return (
        <Post>
            <LeftContainer>
                <img src={photo_author} alt="foto-perfil" />
                {isLiked ? <Heart onClick={handleLike} /> : <HeartTransparent onClick={handleLike} />}
                <p data-tooltip-id="my-tooltip" data-tooltip-content={likesDescription}>{likesPost > 1 ? `${likesPost} likes` : `${likesPost} like`}</p>
                <Tooltip
                    id="my-tooltip"
                    place="bottom"
                    style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "#505050" }}
                />
            </LeftContainer>
            <RightContainer>
                <RightTopContainer>
                    <h2>{post_author}</h2>
                    <div>
                        <EditIcon onClick={() => isEditing ? cancelEdit() : openEdit()} color='#FFF' size='20px' />
                        <DeleteButton idPost={id} postsAreChanged={postsAreChanged} setPostsAreChanged={setPostsAreChanged} />
                    </div>
                </RightTopContainer>
                {isEditing ?
                    <input 
                        ref={inputRef} 
                        onKeyDown={handleKeyDown} 
                        onChange={(e) => setDescriptionInput(e.target.value)} 
                        value={descriptionInput} 
                        type="text" 
                        disabled={isConfirmingEdit}
                    />
                    :
                    <p>{description}</p>
                }
                <a>{post_link}</a>
            </RightContainer>
        </Post>
    )
}