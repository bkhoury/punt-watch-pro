"use client";

import { useState, useEffect } from "react";
import { getCommentsSnapshot, addComment, deleteComment, getUsersByUids } from "@/src/lib/firebase/firestore.js";
import { getCurrentUser } from "@/src/lib/firebase/auth.js";

export default function PuntComments({ puntId }) {
  const [comments, setComments] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [text, setText] = useState("");

  useEffect(() => {
    return getCommentsSnapshot(puntId, (data) => {
      setComments(data);
      const uids = [...new Set(data.map((c) => c.uid).filter(Boolean))];
      getUsersByUids(uids).then(setUsersMap);
    });
  }, [puntId]);

  const currentUser = getCurrentUser();

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser || !text.trim()) return;
    addComment(puntId, currentUser.uid, text.trim());
    setText("");
  };

  return (
    <div className="comments">
      {comments.length > 0 && (
        <ul className="comments__list">
          {comments.map((comment) => {
            const author = usersMap[comment.uid];
            return (
              <li key={comment.id} className="comment">
                <div className="comment__badge">
                  <img
                    className="comment__pic"
                    src={author?.photoURL || "/profile.svg"}
                    alt={author?.displayName || "Unknown"}
                    onError={(e) => { e.target.src = "/profile.svg"; }}
                  />
                  <span className="comment__name">{author?.displayName || "Unknown"}</span>
                </div>
                <p className="comment__text">{comment.text}</p>
                {currentUser?.uid === comment.uid && (
                  <button
                    type="button"
                    className="comment__delete"
                    onClick={() => deleteComment(puntId, comment.id)}
                  >
                    ✕
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <form className="comment__form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="comment__input"
        />
        <button type="submit" className="comment__submit" disabled={!text.trim()}>
          Post
        </button>
      </form>
    </div>
  );
}
