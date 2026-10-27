import { useState, useMemo } from 'react';
import {
  Star,
  Search,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Send,
  Trash2,
  EyeOff,
  RefreshCw,
  MapPin,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllReviews,
  updateReviewStatus,
  replyToReview,
  deleteReview,
  getReviewStats,
  type CustomerReview,
} from '@/services/reviewService';
import { triggerHaptic } from '@/services/mobileService';

type StatusFilter = 'all' | 'pending' | 'approved' | 'hidden';
type RatingFilter = 'all' | '5' | '4' | '3-below';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>(() => getAllReviews());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadReviewsData = () => {
    triggerHaptic('light');
    setReviews(getAllReviews());
  };

  const stats = useMemo(() => getReviewStats(reviews), [reviews]);

  // Filtered reviews
  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.customerName.toLowerCase().includes(q) ||
        r.headline.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q);

      if (!matchSearch) return false;

      // Status match
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;

      // Rating match
      if (ratingFilter === '5' && r.rating !== 5) return false;
      if (ratingFilter === '4' && r.rating !== 4) return false;
      if (ratingFilter === '3-below' && r.rating > 3) return false;

      return true;
    });
  }, [reviews, search, statusFilter, ratingFilter]);

  const handleStatusChange = (id: string, status: 'approved' | 'pending' | 'hidden') => {
    triggerHaptic('success');
    const updated = updateReviewStatus(id, status);
    if (updated) {
      setReviews(getAllReviews());
      toast.success(`Review marked as ${status}`);
    }
  };

  const handleOpenReply = (review: CustomerReview) => {
    triggerHaptic('medium');
    setReplyingReviewId(review.id);
    setReplyText(review.adminResponse || '');
  };

  const handleSaveReply = (id: string) => {
    if (!replyText.trim()) {
      triggerHaptic('error');
      toast.error('Please enter a response message.');
      return;
    }
    triggerHaptic('success');
    replyToReview(id, replyText);
    setReviews(getAllReviews());
    setReplyingReviewId(null);
    setReplyText('');
    toast.success('Official bakery response published!');
  };

  const handleDelete = (id: string) => {
    triggerHaptic('warning');
    deleteReview(id);
    setReviews(getAllReviews());
    setConfirmDeleteId(null);
    toast.success('Review permanently deleted');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] border border-[var(--color-brand-primary)]/30">
                Customer Sentiment & Moderation
              </span>
              <span className="text-xs text-[var(--color-brand-muted)]">• Admin Exclusive</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--color-brand-chocolate)]">
              Customer Reviews & Feedback
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-brand-muted)] mt-1 max-w-2xl leading-relaxed">
              Moderate verified customer ratings, reply to feedback with official bakery responses, and maintain your luxury patisserie rating standards.
            </p>
          </div>

          <button
            onClick={loadReviewsData}
            className="px-4 py-2 bg-[var(--color-brand-cream-dark)] hover:bg-[var(--color-brand-surface-elevated)] border border-[var(--color-brand-border)] text-[var(--color-brand-chocolate)] text-xs font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw size={14} /> Refresh Feed
          </button>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mt-6 pt-6 border-t border-[var(--color-brand-border)]">
          <div className="bg-[var(--color-brand-surface-elevated)] p-4 rounded-xl border border-[var(--color-brand-border)]">
            <span className="text-[11px] font-bold text-[var(--color-brand-muted)] uppercase tracking-wider block mb-1">
              Average Rating
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[var(--color-brand-chocolate)]">
                {stats.averageRating}
              </span>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="currentColor" />
                ))}
              </div>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
              ★ Top 1% artisanal standard
            </span>
          </div>

          <div className="bg-[var(--color-brand-surface-elevated)] p-4 rounded-xl border border-[var(--color-brand-border)]">
            <span className="text-[11px] font-bold text-[var(--color-brand-muted)] uppercase tracking-wider block mb-1">
              Total Reviews
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[var(--color-brand-chocolate)]">
              {stats.total}
            </span>
            <span className="text-[10px] text-[var(--color-brand-muted)] font-medium mt-1 block">
              {stats.approvedCount} approved & live
            </span>
          </div>

          <div className="bg-[var(--color-brand-surface-elevated)] p-4 rounded-xl border border-[var(--color-brand-border)]">
            <span className="text-[11px] font-bold text-[var(--color-brand-muted)] uppercase tracking-wider block mb-1">
              Needs Moderation
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                {stats.pendingCount}
              </span>
              {stats.pendingCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <span className="text-[10px] text-[var(--color-brand-muted)] font-medium mt-1 block">
              Awaiting admin approval
            </span>
          </div>

          <div className="bg-[var(--color-brand-surface-elevated)] p-4 rounded-xl border border-[var(--color-brand-border)]">
            <span className="text-[11px] font-bold text-[var(--color-brand-muted)] uppercase tracking-wider block mb-1">
              5-Star Share
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.total > 0 ? Math.round((stats.fiveStarCount / stats.total) * 100) : 100}%
            </span>
            <span className="text-[10px] text-[var(--color-brand-muted)] font-medium mt-1 block">
              {stats.fiveStarCount} perfect score orders
            </span>
          </div>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, cake, city..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] text-[var(--color-brand-chocolate)] rounded-xl outline-none focus:border-[var(--color-brand-primary)]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-[var(--color-brand-cream-dark)] p-1 rounded-xl border border-[var(--color-brand-border)]">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'pending', label: `Pending (${stats.pendingCount})` },
                { id: 'approved', label: 'Approved' },
                { id: 'hidden', label: 'Hidden' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  triggerHaptic('selection');
                  setStatusFilter(f.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-[var(--color-brand-surface)] text-[var(--color-brand-chocolate)] shadow-xs'
                    : 'text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Rating Dropdown Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => {
              triggerHaptic('selection');
              setRatingFilter(e.target.value as RatingFilter);
            }}
            className="px-3 py-2 bg-[var(--color-brand-surface-elevated)] border border-[var(--color-brand-border)] text-xs font-bold text-[var(--color-brand-chocolate)] rounded-xl outline-none cursor-pointer"
          >
            <option value="all">All Stars</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars</option>
            <option value="3-below">3 Stars & Below</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {filtered.length === 0 ? (
        <div className="bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] rounded-2xl p-12 text-center">
          <MessageSquare size={36} className="mx-auto text-[var(--color-brand-muted)] mb-3 opacity-60" />
          <h3 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)]">
            No reviews match your filters
          </h3>
          <p className="text-xs text-[var(--color-brand-muted)] mt-1 max-w-sm mx-auto">
            Try adjusting your search query, status filters, or star rating selections.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rev) => {
            const isReplying = replyingReviewId === rev.id;

            return (
              <div
                key={rev.id}
                className="bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] rounded-2xl p-5 sm:p-6 shadow-xs transition-all hover:border-[var(--color-brand-primary)]/50"
              >
                {/* Review Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] font-black text-sm flex items-center justify-center flex-shrink-0">
                      {rev.customerName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[var(--color-brand-chocolate)]">
                          {rev.customerName}
                        </span>
                        {rev.verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={11} /> Verified Order
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--color-brand-muted)] mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {rev.location}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock size={11} /> {new Date(rev.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating & Status Badge */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < rev.rating ? 'currentColor' : 'none'}
                          className={i < rev.rating ? 'text-amber-400' : 'text-gray-300 dark:text-neutral-700'}
                        />
                      ))}
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        rev.status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : rev.status === 'pending'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>
                </div>

                {/* Cake Badge */}
                <div className="inline-block px-2.5 py-1 rounded-lg bg-[var(--color-brand-surface-elevated)] border border-[var(--color-brand-border)] text-[11px] font-bold text-[var(--color-brand-chocolate)] mb-3">
                  🎂 Ordered: <span className="text-[var(--color-brand-primary)]">{rev.productName}</span>
                </div>

                {/* Review Headline & Body */}
                <h4 className="text-sm font-black text-[var(--color-brand-chocolate)] mb-1.5 leading-snug">
                  "{rev.headline}"
                </h4>
                <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed mb-4">
                  {rev.comment}
                </p>

                {/* Official Admin Response Card (if present) */}
                {rev.adminResponse && !isReplying && (
                  <div className="bg-[var(--color-brand-surface-elevated)] border-l-3 border-[var(--color-brand-primary)] p-3.5 rounded-r-xl mb-4 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[var(--color-brand-chocolate)] flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-[var(--color-brand-primary)]" />
                        Official YOYO Patisserie Response:
                      </span>
                      <button
                        onClick={() => handleOpenReply(rev)}
                        className="text-[10px] text-[var(--color-brand-primary)] hover:underline font-bold"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-[var(--color-brand-muted)] leading-relaxed">{rev.adminResponse}</p>
                  </div>
                )}

                {/* Inline Reply Form */}
                {isReplying && (
                  <div className="bg-[var(--color-brand-surface-elevated)] p-4 rounded-xl border border-[var(--color-brand-border)] mb-4 space-y-2.5">
                    <label className="text-xs font-bold text-[var(--color-brand-chocolate)] block">
                      Write Official Bakery Response:
                    </label>
                    {/* Quick Bakery Reply Templates */}
                    <div className="space-y-1 mb-2">
                      <span className="text-[10px] font-bold text-[var(--color-brand-muted)] uppercase tracking-wider block">
                        Quick Reply Templates:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          '🎉 Thank you so much for celebrating with YOYO Patisserie! We are glad you loved every layer.',
                          '🍫 Glad you enjoyed that iconic Belgian chocolate snap and silk mousse!',
                          '🎂 Thank you for trusting us with your special celebration! Looking forward to baking for you again.',
                          '📞 We apologize for the delay. Our store manager will reach out to you directly to make this right.',
                        ].map((tmpl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              setReplyText(tmpl);
                            }}
                            className="text-[10px] bg-[var(--color-brand-surface)] hover:bg-[var(--color-brand-cream-dark)] text-[var(--color-brand-chocolate)] px-2.5 py-1 rounded-md border border-[var(--color-brand-border)] transition-colors text-left font-medium cursor-pointer"
                          >
                            {tmpl.slice(0, 36)}...
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                      placeholder="Thank the customer or address their note professionally..."
                      className="w-full p-2.5 text-xs rounded-lg border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] text-[var(--color-brand-chocolate)] outline-none focus:border-[var(--color-brand-primary)] resize-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setReplyingReviewId(null)}
                        className="px-3 py-1.5 text-xs text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)] font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveReply(rev.id)}
                        className="px-4 py-1.5 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-dark)] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send size={12} /> Publish Response
                      </button>
                    </div>
                  </div>
                )}

                {/* Moderation Controls Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--color-brand-border)]">
                  <div className="flex items-center gap-2">
                    {rev.status !== 'approved' && (
                      <button
                        onClick={() => handleStatusChange(rev.id, 'approved')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 size={13} /> Approve
                      </button>
                    )}

                    {rev.status !== 'hidden' && (
                      <button
                        onClick={() => handleStatusChange(rev.id, 'hidden')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-500/10 hover:bg-neutral-500/20 text-neutral-600 dark:text-neutral-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <EyeOff size={13} /> Hide
                      </button>
                    )}

                    {!rev.adminResponse && !isReplying && (
                      <button
                        onClick={() => handleOpenReply(rev)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--color-brand-cream-dark)] hover:bg-[var(--color-brand-surface-elevated)] text-[var(--color-brand-chocolate)] transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare size={13} /> Reply to Customer
                      </button>
                    )}
                  </div>

                  {/* Delete Button */}
                  <div>
                    {confirmDeleteId === rev.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDelete(rev.id)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 text-white rounded-lg cursor-pointer"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 text-[11px] text-[var(--color-brand-muted)] font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(rev.id)}
                        className="p-1.5 text-[var(--color-brand-muted)] hover:text-rose-500 transition-colors cursor-pointer rounded-lg hover:bg-rose-500/10"
                        title="Delete review"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
