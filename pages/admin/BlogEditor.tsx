import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Tag } from 'lucide-react';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const BlogEditor: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id && id !== 'new';

    const [isLoading, setIsLoading] = useState(isEditing);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        cover_image: '',
        tags: '',
        seo_title: '',
        seo_description: '',
        is_published: false
    });

    useEffect(() => {
        if (isEditing) {
            const fetchPost = async () => {
                const { data, error } = await supabase
                    .from('blog_posts')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    toast.error('Failed to load post');
                    navigate('/admin/blog');
                } else if (data) {
                    setFormData({
                        title: data.title,
                        slug: data.slug,
                        excerpt: data.excerpt || '',
                        content: data.content || '',
                        cover_image: data.cover_image || '',
                        tags: data.tags?.join(', ') || '',
                        seo_title: data.seo_title || '',
                        seo_description: data.seo_description || '',
                        is_published: data.is_published
                    });
                }
                setIsLoading(false);
            };

            fetchPost();
        }
    }, [id, isEditing, navigate]);

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: !isEditing && prev.slug === generateSlug(prev.title) ? generateSlug(title) : prev.slug
        }));
    };

    const handleSave = async (publish = false) => {
        if (!formData.title || !formData.slug) {
            toast.error('Title and Slug are required');
            return;
        }

        setIsSaving(true);
        const postData = {
            title: formData.title,
            slug: formData.slug,
            excerpt: formData.excerpt,
            content: formData.content,
            cover_image: formData.cover_image,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            seo_title: formData.seo_title,
            seo_description: formData.seo_description,
            is_published: publish ? true : formData.is_published,
            published_at: publish ? new Date().toISOString() : undefined,
            updated_at: new Date().toISOString()
        };

        let error;

        if (isEditing) {
            const { error: updateError } = await supabase
                .from('blog_posts')
                .update(postData)
                .eq('id', id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('blog_posts')
                .insert([{ ...postData, author_id: (await supabase.auth.getUser()).data.user?.id }]);
            error = insertError;
        }

        setIsSaving(false);

        if (error) {
            console.error(error);
            toast.error('Failed to save post');
        } else {
            toast.success('Post saved successfully');
            navigate('/admin/blog');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin text-accent-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-background/95 backdrop-blur z-10 py-4 border-b border-border">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/blog')} className="text-textMuted hover:text-textMain">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-textMain">{isEditing ? 'Edit Post' : 'New Post'}</h1>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}>
                        Save Draft
                    </Button>
                    <Button onClick={() => handleSave(true)} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="mr-2" />}
                        {formData.is_published ? 'Update & Publish' : 'Publish Now'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface border border-border rounded-xl p-6">
                        <label className="block text-sm font-bold text-textMain mb-2">Post Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={handleTitleChange}
                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-lg font-bold focus:outline-none focus:border-accent-primary mb-4"
                            placeholder="Enter post title..."
                        />

                        <label className="block text-sm font-bold text-textMain mb-2">Slug (URL)</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-textMuted font-mono text-sm focus:outline-none focus:border-accent-primary"
                        />
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-6 min-h-[500px]">
                        <label className="block text-sm font-bold text-textMain mb-2">Content (Markdown)</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full h-[600px] bg-background border border-border rounded-lg p-4 font-mono text-sm leading-relaxed focus:outline-none focus:border-accent-primary resize-none"
                            placeholder="# Write your masterpiece..."
                        />
                        <p className="text-xs text-textMuted mt-2 text-right">Markdown Supported</p>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-surface border border-border rounded-xl p-6">
                        <h3 className="font-bold text-textMain mb-4 flex items-center gap-2"><ImageIcon size={18} /> Cover Image</h3>
                        <input
                            type="text"
                            value={formData.cover_image}
                            onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary mb-4"
                            placeholder="https://example.com/image.jpg"
                        />
                        {formData.cover_image && (
                            <div className="aspect-video rounded-lg overflow-hidden bg-surfaceHighlight">
                                <img src={formData.cover_image} alt="Cover" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-6">
                        <h3 className="font-bold text-textMain mb-4">Excerpt</h3>
                        <textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            className="w-full h-24 bg-background border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-accent-primary"
                            placeholder="Short summary for cards..."
                        />
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-6">
                        <h3 className="font-bold text-textMain mb-4 flex items-center gap-2"><Tag size={18} /> Tags</h3>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary"
                            placeholder="tech, marketing, tutorial (comma separated)"
                        />
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-6">
                        <h3 className="font-bold text-textMain mb-4">SEO Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-textMuted mb-1">Meta Title</label>
                                <input
                                    type="text"
                                    value={formData.seo_title}
                                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-textMuted mb-1">Meta Description</label>
                                <textarea
                                    value={formData.seo_description}
                                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                                    className="w-full h-20 bg-background border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-accent-primary"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogEditor;
