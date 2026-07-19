import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Clock, Calendar, User, Film, AlertCircle, Edit, Trash2, Heart, ArrowLeft, Play } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button, Modal, Input, Spinner, Skeleton, Card } from '../../components/ui';
import styles from './MovieDetails.module.css';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // Estados locais
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [heartPulse, setHeartPulse] = useState(0);
  const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);

  // 1. Busca os detalhes do filme (incluindo reviews e gêneros)
  const { data: movie, isLoading, isError, error } = useQuery({
    queryKey: ['movie', id],
    queryFn: async () => {
      const response = await api.get(`/api/Movies/${id}`);
      return response.data;
    },
  });

  // 2. Busca lista de favoritos do usuário para saber se este filme está favoritado
  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await api.get('/api/Favorites');
      return response.data || [];
    },
    enabled: isAuthenticated, // Só roda se logado
  });

  // 3. Busca a disponibilidade de streaming sob demanda quando o modal for aberto
  const { data: streamingAvailability, isLoading: isStreamingLoading } = useQuery({
    queryKey: ['streaming-platforms', id],
    queryFn: async () => {
      const response = await api.get(`/api/Movies/${id}/streaming-platforms`);
      return response.data;
    },
    enabled: isPlayModalOpen,
  });

  const isFavorited = favorites.some((fav) => fav.id === id);

  // Mutation: Alternar Favorito
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        await api.delete(`/api/Favorites/${id}`);
      } else {
        await api.post(`/api/Favorites/${id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(isFavorited ? 'Removido dos favoritos!' : 'Adicionado aos favoritos!');
    },
    onError: (err) => {
      toast.error(err.message || 'Erro ao atualizar favoritos.');
    },
  });

  // Mutation: Criar Avaliação
  const addReviewMutation = useMutation({
    mutationFn: async (newReview) => {
      const response = await api.post(`/api/Movies/${id}/reviews`, newReview);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movie', id] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      setCommentInput('');
      setRatingInput(5);
      toast.success('Avaliação enviada com sucesso!');
    },
    onError: (err) => {
      toast.error(err.message || 'Erro ao enviar avaliação.');
    },
  });

  // Mutation: Editar Avaliação
  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, updatedFields }) => {
      const response = await api.put(`/api/Movies/${id}/reviews/${reviewId}`, updatedFields);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movie', id] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      setIsEditing(false);
      setEditingReview(null);
      toast.success('Avaliação atualizada!');
    },
    onError: (err) => {
      toast.error(err.message || 'Erro ao atualizar avaliação.');
    },
  });

  // Mutation: Excluir Avaliação
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId) => {
      await api.delete(`/api/Movies/${id}/reviews/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movie', id] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.success('Avaliação removida.');
    },
    onError: (err) => {
      toast.error(err.message || 'Erro ao excluir avaliação.');
    },
  });

  // Helper para converter link comum do YouTube para embed iframe
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    let videoId = null;

    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);

      if (match && match[2].length === 11) {
        videoId = match[2];
      }
    } catch (e) {
      console.error('Erro ao extrair ID do trailer:', e);
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  // Verifica se o usuário logado já avaliou este filme
  const userReview = movie?.reviews?.find((r) => r.userId === user?.id);

  const handleAddReviewSubmit = (e) => {
    e.preventDefault();
    if (!ratingInput) {
      toast.error('Selecione uma nota de 1 a 5.');
      return;
    }
    addReviewMutation.mutate({
      rating: ratingInput,
      comment: commentInput.trim(),
    });
  };

  const handleEditClick = (review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setIsEditing(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateReviewMutation.mutate({
      reviewId: editingReview.id,
      updatedFields: {
        rating: editRating,
        comment: editComment.trim(),
      },
    });
  };

  const handleDeleteClick = (reviewId) => {
    Swal.fire({
      title: 'Excluir Avaliação?',
      text: 'Você tem certeza que quer remover sua nota e comentário?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary-color)',
      cancelButtonColor: 'var(--color-error)',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
      background: 'var(--surface-color)',
      color: 'var(--text-main)',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteReviewMutation.mutate(reviewId);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="page-fade-in" style={{ padding: '60px 0' }}>
        <Skeleton variant="rect" height="380px" style={{ marginBottom: '40px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '48px' }}>
          <div>
            <Skeleton variant="title" width="40%" />
            <Skeleton variant="text" />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="80%" />
          </div>
          <div>
            <Skeleton variant="rect" height="200px" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-fade-in" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: 'var(--color-error)', marginBottom: '16px' }} />
        <h2>Filme Não Encontrado</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          {error?.message || 'Erro ao carregar dados do filme.'}
        </p>
        <Link to="/catalogo">
          <Button variant="primary">Voltar para o Catálogo</Button>
        </Link>
      </div>
    );
  }

  const embedTrailerUrl = getYouTubeEmbedUrl(movie.trailerUrl);
  const formattedRating = movie.averageRating > 0 ? movie.averageRating.toFixed(1) : 'N/A';

  const getRatingStyle = (rating) => {
    const cleanRating = rating?.toString().replace('+', '').trim().toUpperCase();
    switch (cleanRating) {
      case 'L':
      case 'LIVRE':
        return { backgroundColor: '#00A859', color: '#FFFFFF' };
      case '10':
        return { backgroundColor: '#0F9FD7', color: '#FFFFFF' };
      case '12':
        return { backgroundColor: '#ECC31F', color: '#FFFFFF' };
      case '14':
        return { backgroundColor: '#E87C24', color: '#FFFFFF' };
      case '16':
        return { backgroundColor: '#E11A22', color: '#FFFFFF' };
      case '18':
        return { backgroundColor: '#1D1D1B', color: '#FFFFFF' };
      default:
        return { backgroundColor: 'var(--accent-color)', color: 'var(--text-dark)' };
    }
  };

  const getStreamingPlatforms = (platformsJson) => {
    if (!platformsJson) return [];
    try {
      return JSON.parse(platformsJson);
    } catch (e) {
      console.error('Erro ao processar JSON de plataformas de streaming:', e);
      return [];
    }
  };

  const streamingPlatforms = streamingAvailability?.platforms || getStreamingPlatforms(movie?.streamingPlatforms);

  const formatTimeDifference = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return `há ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    return `há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
  };

  const formatReviewDate = (review) => {
    const createdDate = new Date(review.createdAt);
    const formattedCreated = createdDate.toLocaleDateString('pt-BR');
    
    if (review.updatedAt) {
      const updatedDate = new Date(review.updatedAt);
      if (Math.abs(updatedDate.getTime() - createdDate.getTime()) > 1000) {
        return `${formattedCreated} (Editado ${formatTimeDifference(review.updatedAt)})`;
      }
    }
    
    return formattedCreated;
  };

  return (
    <div className={`page-fade-in ${styles.container}`}>
      {/* Botão flutuante para voltar */}
      <Link to="/catalogo" className={styles.backLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '20px', transition: 'color 0.2s' }}>
        <ArrowLeft size={16} />
        <span>Voltar para o Catálogo</span>
      </Link>

      {/* Banner de Cabeçalho decorativo */}
      <section className={styles.banner}>
        {movie.imageUrl && (
          <img src={movie.imageUrl} alt="" className={styles.bannerBg} />
        )}
        <div className={styles.bannerOverlay}></div>
        
        <div className={styles.headerContent}>
          <div className={styles.posterWrapper}>
            {movie.imageUrl ? (
              <img src={movie.imageUrl} alt={movie.title} className={styles.poster} />
            ) : (
              <div className={styles.posterPlaceholder}>
                <Film size={48} />
                <span>Sem Foto</span>
              </div>
            )}
          </div>

          <div className={styles.mainInfo}>
            <h1 className={styles.title}>{movie.title}</h1>
            
            <div className={styles.metaRow}>
              {movie.rating && (
                <span className={styles.ratingBadge} style={getRatingStyle(movie.rating)}>{movie.rating}</span>
              )}
              <div className={styles.metaItem}>
                <Calendar size={16} />
                <span>{movie.releaseYear}</span>
              </div>
              <div className={styles.metaItem}>
                <Clock size={16} />
                <span>{movie.durationMinutes} min</span>
              </div>
              <div className={styles.scoreWrapper}>
                <Star size={16} fill="currentColor" />
                <span>{formattedRating} ({movie.reviewsCount} avaliações)</span>
              </div>
            </div>

            {/* Favorito Button */}
            {isAuthenticated && (
              <Button
                variant={isFavorited ? 'primary' : 'secondary'}
                onClick={() => {
                  setHeartPulse((n) => n + 1);
                  toggleFavoriteMutation.mutate();
                }}
                leftIcon={
                  <Heart
                    key={heartPulse}
                    size={16}
                    fill={isFavorited ? 'currentColor' : 'none'}
                    className={heartPulse > 0 ? styles.heartPulse : undefined}
                  />
                }
                isLoading={toggleFavoriteMutation.isPending}
                style={{ marginTop: '12px' }}
              >
                {isFavorited ? 'Favoritado' : 'Adicionar aos Favoritos'}
              </Button>
            )}

            <div className={styles.genres}>
              {movie.genres?.map((g) => (
                <span key={g.id} className={styles.genreTag}>
                  {g.name}
                </span>
              ))}
            </div>
          </div>

          {/* Botão de Play Grande e Redondo Transparente no canto direito */}
          <button 
            className={styles.playButton} 
            onClick={() => setIsPlayModalOpen(true)} 
            title="Assistir Filme"
          >
            <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />
          </button>
        </div>
      </section>

      {/* Corpo Detalhado */}
      <div className={styles.bodyGrid}>
        <div className={styles.leftCol}>
          {/* Sinopse */}
          <div>
            <h3 className={styles.sectionTitle}>Sinopse</h3>
            <p className={styles.synopsis}>
              {movie.synopsis || 'Nenhuma sinopse disponível para este filme.'}
            </p>
          </div>

          {/* Elenco */}
          {movie.cast && (
            <div>
              <h3 className={styles.sectionTitle}>Elenco Principal</h3>
              <p className={styles.synopsis} style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
                {movie.cast}
              </p>
            </div>
          )}

          {/* Trailer (Vídeo Embed) */}
          {embedTrailerUrl && (
            <div>
              <h3 className={styles.sectionTitle}>Trailer Oficial</h3>
              <div className={styles.trailerWrapper}>
                <iframe
                  className={styles.trailerIframe}
                  src={embedTrailerUrl}
                  title={`Trailer de ${movie.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {/* Seção de Comentários / Reviews */}
          <div className={styles.reviewsSection}>
            <h3 className={styles.sectionTitle}>Avaliações da Comunidade</h3>

            {/* Formulário para adicionar nova review */}
            {isAuthenticated ? (
              !userReview ? (
                <div className={styles.reviewFormCard}>
                  <h4 style={{ marginBottom: '16px' }}>Escrever Avaliação</h4>
                  <form onSubmit={handleAddReviewSubmit}>
                    <div className={styles.ratingSelector}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sua Nota:</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`${styles.starBtn} ${star <= ratingInput ? styles.starBtnActive : ''}`}
                            onClick={() => setRatingInput(star)}
                          >
                            <Star size={24} fill={star <= ratingInput ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      placeholder="Deixe sua opinião sincera sobre o filme..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className={styles.commentTextarea}
                      maxLength={2000}
                      required
                    ></textarea>

                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={addReviewMutation.isPending}
                    >
                      {addReviewMutation.isPending ? 'Enviando Avaliação' : 'Enviar Avaliação'}
                    </Button>
                  </form>
                </div>
              ) : (
                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--border-radius-lg)',
                  marginBottom: '32px',
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)'
                }}>
                  Você já avaliou este filme. Você pode editar ou remover sua avaliação existente na lista abaixo.
                </div>
              )
            ) : (
              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(76, 95, 213, 0.05)',
                border: '1px dashed rgba(76, 95, 213, 0.2)',
                borderRadius: 'var(--border-radius-lg)',
                textAlign: 'center',
                marginBottom: '32px'
              }}>
                <span style={{ marginRight: '8px', color: 'var(--text-muted)' }}>Quer deixar sua opinião?</span>
                <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 700 }}>Faça Login</Link>
              </div>
            )}

            {/* Lista de Reviews */}
            <div className={styles.reviewList}>
              {movie.reviews?.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Nenhuma avaliação escrita. Seja o primeiro a opinar!
                </p>
              ) : (
                movie.reviews?.map((review) => {
                  const isOwner = review.userId === user?.id;
                  
                  return (
                    <div key={review.id} className={styles.reviewCard}>
                      <div className={styles.reviewHeader}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <img
                            src={review.userAvatarUrl || '/default-avatar.png'}
                            alt={`Avatar de ${review.userName}`}
                            className={styles.reviewAvatar}
                            onError={(e) => { e.target.src = '/default-avatar.png'; }}
                          />
                          <div>
                            <p className={styles.reviewUser}>
                              {review.userName} {isOwner && <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', marginLeft: '4px', backgroundColor: 'rgba(76, 95, 213, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>Você</span>}
                            </p>
                            <span className={styles.reviewMeta}>
                              {formatReviewDate(review)}
                            </span>
                          </div>
                        </div>

                        {isOwner && (
                          <div className={styles.reviewActions}>
                            <button
                              onClick={() => handleEditClick(review)}
                              className={styles.actionBtn}
                              title="Editar avaliação"
                            >
                              <Edit size={14} />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(review.id)}
                              className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                              title="Excluir avaliação"
                            >
                              <Trash2 size={14} />
                              <span>Excluir</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Estrelas do comentário */}
                      <div className={styles.reviewStars}>
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            size={16}
                            fill={idx < review.rating ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>

                      <p className={styles.reviewComment}>{review.comment}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Ficha Técnica Lateral */}
        <div className={styles.rightCol}>
          <div className={styles.detailCard}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontFamily: 'var(--font-body)' }}>Ficha Técnica</h3>
            
            <div className={styles.technicalItem}>
              <p className={styles.techLabel}>Diretor</p>
              <p className={styles.techVal}>{movie.director || 'Não informado'}</p>
            </div>

            <div className={styles.technicalItem}>
              <p className={styles.techLabel}>Ano de Lançamento</p>
              <p className={styles.techVal}>{movie.releaseYear}</p>
            </div>

            <div className={styles.technicalItem}>
              <p className={styles.techLabel}>Duração</p>
              <p className={styles.techVal}>{movie.durationMinutes} minutos</p>
            </div>

            <div className={styles.technicalItem}>
              <p className={styles.techLabel}>Classificação</p>
              <p className={styles.techVal}>{movie.rating || 'Livre'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição de Review */}
      <Modal
        isOpen={isEditing}
        onClose={() => {
          setIsEditing(false);
          setEditingReview(null);
        }}
        title="Editar Avaliação"
        size="md"
      >
        {editingReview && (
          <form onSubmit={handleEditSubmit}>
            <div className={styles.ratingSelector}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sua Nota:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`${styles.starBtn} ${star <= editRating ? styles.starBtnActive : ''}`}
                    onClick={() => setEditRating(star)}
                  >
                    <Star size={24} fill={star <= editRating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              placeholder="Edite seu comentário..."
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              className={styles.commentTextarea}
              maxLength={2000}
              required
            ></textarea>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  setEditingReview(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={updateReviewMutation.isPending}
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Onde Assistir (Play) */}
      <Modal
        isOpen={isPlayModalOpen}
        onClose={() => setIsPlayModalOpen(false)}
        title="Onde Assistir"
        size="sm"
      >
        <div className={styles.platformsContainer}>
          {isStreamingLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 0', gap: '12px' }}>
              <Spinner size="md" variant="accent" />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Buscando plataformas atualizadas...</p>
            </div>
          ) : streamingPlatforms && streamingPlatforms.length > 0 ? (
            <>
              <p className={styles.platformsSubtitle}>Disponível nas seguintes plataformas:</p>
              <div className={styles.platformsList}>
                {streamingPlatforms.map((platform, idx) => (
                  <div key={idx} className={styles.platformItem}>
                    <span className={styles.platformName}>{platform.name}</span>
                    <a
                      href={platform.link || platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.platformPlayBtn}
                    >
                      <Play size={12} fill="currentColor" />
                      <span>Acessar</span>
                    </a>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Film size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-muted)' }}>Este filme não está disponível em plataformas de streaming no momento.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default MovieDetails;
