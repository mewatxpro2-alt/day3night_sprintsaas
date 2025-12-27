import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BlogPost } from '../../lib/database.types';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Loader2, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const BlogManager: React.FC = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPosts = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching posts:', error);
            toast.error('Failed to load posts');
        } else {
            setPosts(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleTogglePublish = async (post: BlogPost) => {
        const newStatus = !post.is_published;
        const { error } = await supabase
            .from('blog_posts')
            .update({
                is_published: newStatus,
                published_at: newStatus ? new Date().toISOString() : post.published_at
            })
            .eq('id', post.id);

        if (error) {
            toast.error('Failed to update status');
        } else {
            toast.success(newStatus ? 'Post published' : 'Post unpublished');
            fetchPosts();
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Failed to delete post');
        } else {
            toast.success('Post deleted');
            setPosts(posts.filter(p => p.id !== id));
        }
    };

    const handleSeed = async () => {
        setIsLoading(true);
        const samplePosts = [
            {
                slug: 'why-buy-saas-boilerplate-2025',
                title: 'Why Smart Founders Are Buying SaaS Boilerplates in 2025',
                excerpt: 'Stop building auth and payments from scratch. Discover why 40% of micro-SaaS founders now start with a generic codebase to ship 3x faster.',
                content: `
> **Key Takeaways**
> *   Building "boring" features like Auth and Billing takes 2-4 weeks.
> *   Boilerplates let you skip to the "Unique Value Proposition" immediately.
> *   The ROI is massive: spending $200 to save 100 dev hours is a no-brainer.

## The Myth of "Building from Scratch"
In 2020, it was a badge of honor to write every line of code. In 2025, it's a liability. 

The market moves too fast. While you are debugging your JWT implementation or fighting with Stripe webhooks, your competitor (who bought a [SprintSaaS](/mvp-kits) blueprint) has already launched and is talking to customers.

### What You Are Actually Buying
When you purchase a codebase from SprintSaaS, you aren't just buying code. You are buying **certainty**.
*   **Production-Ready Auth:** Complete with "Forgot Password", Magic Links, and OAuth.
*   **Stripe Integration:** Webhooks, customer portal, and tiered pricing.
*   **UI Components:** Tailwind-styled dashboards that look premium out of the box.

## The Math: $199 vs $15,000
Let's do the math. A senior React engineer cost $100/hr.
Building a robust authentication and billing system takes at least 40 hours.
*   **Cost to Build:** 40 hours * $100/hr = **$4,000**
*   **Cost to Buy:** **$199**

You are effectively hiring a senior engineer for $5/hr. It is the highest leverage trade you can make as a founder.

## Conclusion
Don't reinvent the wheel. Reinvent the solution to your customer's problem. Start with a solid foundation and ship this weekend.
            `,
                cover_image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2070',
                is_published: true,
                is_featured: true,
                tags: ['SaaS', 'Founders', 'Strategy'],
                published_at: new Date().toISOString(),
                author_id: (await supabase.auth.getUser()).data.user?.id
            },
            {
                slug: 'react-19-server-actions-guide',
                title: 'Mastering React 19 Server Actions for B2B Dashboards',
                excerpt: 'React 19 changes the game for data mutations. Learn how to ditch useEffect for data fetching and streamline your SaaS forms.',
                content: `
> **Key Takeaways**
> *   Server Actions allow you to run backend code directly from form submissions.
> *   No more API routes for simple CRUD operations.
> *   Optimistic UI updates are built-in and easy to implement.

## Goodbye, useEffect
For years, we danced with useEffect to fetch data and needed complex state management for form submissions. React 19 simplifies this violently.

\`\`\`tsx
// The Old Way
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  await fetch('/api/todos', { method: 'POST', body: JSON.stringify(data) });
  setIsLoading(false);
};

// The React 19 Way
async function createTodo(formData: FormData) {
  "use server";
  await db.todos.create({ task: formData.get("task") });
}
\`\`\`

### Why This Matters for SaaS
B2B Dashboards are 90% forms and tables. By using Server Actions, you reduce the client-side JavaScript bundle and make your application faster and more robust even on slow networks.

All our [Next.js Blueprints](/mvp-kits) on SprintSaaS satisfy strict React 19 compliance standards.
            `,
                cover_image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=2070',
                is_published: true,
                is_featured: false,
                tags: ['Engineering', 'React', 'Tutorial'],
                published_at: new Date().toISOString(),
                author_id: (await supabase.auth.getUser()).data.user?.id
            },
            {
                slug: 'transparency-report-audit-process',
                title: 'Transparency Report: How We Reject 40% of Submissions',
                excerpt: 'Quality is our moat. Here is a look inside our manual code review process and the common reasons why seller submissions get rejected.',
                content: `
## Quality Over Quantity
Most marketplaces optimize for volume. They want 10,000 items, and they don't care if half of them are broken.
At SprintSaaS, we optimize for **Trust**.

### The Checklist
Every submission undergoes a 5-point inspection:
1.  **Security Scan:** We run automated tools to check for hardcoded secrets and CVEs.
2.  **Linting:** The code must follow standard ESLint rules. No spaghetti code allowed.
3.  **Documentation:** If the README doesn't explain how to run it in 3 steps, it's out.
4.  **Performance:** We check LightHouse scores.
5.  **Legal:** We verify the seller actually owns the IP.

### Common Rejection Reasons
*   "Legacy Code" using class components in 2025.
*   Missing database migration files.
*   Hardcoded API keys in the frontend bundle.

We do the hard work so you can buy with confidence.
            `,
                cover_image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=2070',
                is_published: true,
                is_featured: false,
                tags: ['Inside SprintSaaS', 'Transparency', 'Trust'],
                published_at: new Date().toISOString(),
                author_id: (await supabase.auth.getUser()).data.user?.id
            },
            {
                slug: 'sell-your-saas-code',
                title: 'From Repo to Revenue: Turning Your Code Into an Asset',
                excerpt: 'A guide for developers on packaging their side projects for sale on SprintSaaS. Clean up, document, and profit.',
                content: `
# You Are Sitting on a Goldmine

As developers, we treat code as disposable. We write it, ship it (maybe), and forget it.
But high-quality code is a durable asset.

## The Rise of the "Micro-Exit"
You don't need to sell your company to Google to have an exit.
Selling the *source code* of your tool to 100 other founders is a "Micro-Exit".

If you sell a [Next.js boilerplate](/mvp-kits) for $100, and you sell 50 copies... that is **$5,000**.
That is a nice vacation. Or a new laptop. Or runway for your next idea.

## How to Package Your Code for Sale
You can't just zip your \`node_modules\` folder.
To sell on SprintSaaS, you need to think like a product manager:
1.  **Clean the Code:** Remove hardcoded API keys. Use \`.env\` files.
2.  **Lint Everything:** Run \`npm run lint\`. Fix the warnings.
3.  **Write Docs:** Pretend the buyer is a junior dev. Explain *exactly* how to start the app.
4.  **Screenshots:** Take beautiful screenshots of the UI. Buyers judge books by covers.

## Join the Marketplace
We are building the premium tier of code marketplaces.
If your code is good enough, we want to help you sell it. [Become a Seller](/submit) today.
            `,
                cover_image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=2070',
                is_published: true,
                is_featured: false,
                tags: ['For Sellers', 'Passive Income'],
                published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
                // author_id: (await supabase.auth.getUser()).data.user?.id
            }
        ];

        // Get current user for author_id
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error('You must be logged in');
            setIsLoading(false);
            return;
        }

        const postsWithAuthor = samplePosts.map(p => ({ ...p, author_id: user.id }));

        const { error } = await supabase.from('blog_posts').insert(postsWithAuthor);

        if (error) {
            console.error(error);
            toast.error('Failed to seed posts');
        } else {
            toast.success('Strategy content loaded! (6 Articles)');
            fetchPosts();
        }
        setIsLoading(false);
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-textMain mb-2">Blog Posts</h1>
                    <p className="text-textMuted">Manage your articles, tutorials, and updates.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={handleSeed}>
                        Load Strategy Content (6 Posts)
                    </Button>
                    <Button onClick={() => navigate('/admin/blog/new')}>
                        <Plus size={18} className="mr-2" /> New Post
                    </Button>
                </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 mb-8">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-accent-primary"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-accent-primary" size={32} />
                </div>
            ) : (
                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surfaceHighlight border-b border-border">
                                <th className="p-4 text-sm font-bold text-textSecondary uppercase">Title</th>
                                <th className="p-4 text-sm font-bold text-textSecondary uppercase">Status</th>
                                <th className="p-4 text-sm font-bold text-textSecondary uppercase">Published</th>
                                <th className="p-4 text-sm font-bold text-textSecondary uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredPosts.map(post => (
                                <tr key={post.id} className="hover:bg-surfaceHighlight/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-semibold text-textMain">{post.title}</div>
                                        <div className="text-xs text-textMuted flex items-center gap-1">
                                            /{post.slug} <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer"><ArrowUpRight size={10} className="hover:text-accent-primary" /></a>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${post.is_published
                                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                            : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                            }`}>
                                            {post.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-textMuted">
                                        {post.published_at ? new Date(post.published_at).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleTogglePublish(post)}
                                                className="p-2 rounded-lg hover:bg-surfaceHighlight text-textMuted hover:text-textMain transition-colors"
                                                title={post.is_published ? "Unpublish" : "Publish"}
                                            >
                                                {post.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                            <button
                                                onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                                                className="p-2 rounded-lg hover:bg-surfaceHighlight text-textMuted hover:text-accent-primary transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-2 rounded-lg hover:bg-surfaceHighlight text-textMuted hover:text-red-500 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredPosts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-textMuted">No posts found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BlogManager;
