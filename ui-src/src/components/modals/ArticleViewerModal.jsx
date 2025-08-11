import React, { useMemo } from "react";
import useGameStore from "../../store";
import Modal from "./Modal";
import "./ArticleViewerModal.css";

const ArticleViewerModal = () => {
  // 1. Select primitive state, stable actions, and raw data arrays directly.
  // This is efficient because their references don't change often.
  const isOpen = useGameStore((state) => state.isArticleModalOpen);
  const viewingArticleId = useGameStore((state) => state.viewingArticleId);
  const closeModal = useGameStore((state) => state.actions.closeArticleModal);
  const newsItems = useGameStore((state) => state.newsItems);
  const newsOutlets = useGameStore(
    (state) => state.activeCampaign?.newsOutlets
  );

  // 2. Derive complex, specific data using useMemo.
  // This caches the result, so the expensive `.find()` operations only re-run when
  // their dependencies (e.g., viewingArticleId) actually change.

  const article = useMemo(() => {
    return viewingArticleId
      ? newsItems.find((n) => n.id === viewingArticleId)
      : null;
  }, [viewingArticleId, newsItems]);

  const outlet = useMemo(() => {
    return article && newsOutlets
      ? newsOutlets.find((o) => o.id === article.outletId)
      : null;
  }, [article, newsOutlets]);

  const author = useMemo(() => {
    return outlet?.staff && article?.authorId
      ? outlet.staff.find((s) => s.id === article.authorId)
      : null;
  }, [outlet, article?.authorId]);

  if (!isOpen || !article) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={outlet?.name || "News Report"}
    >
      <div className="article-viewer-content">
        <h2>{article.headline}</h2>
        <p className="article-byline">
          By {author?.name || "Staff Writer"} | Published on{" "}
          {article.date.month}/{article.date.day}/{article.date.year}
        </p>
        <div className="article-body">
          {article.fullBody?.paragraphs?.map((p, index) => (
            <p key={index}>{p}</p>
          ))}
          {article.fullBody?.quotes?.map((q, index) => (
            <blockquote key={index}>
              <p>"{q.text}"</p>
              <footer>
                — {q.source}, {q.sourceAffiliation}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default ArticleViewerModal;
