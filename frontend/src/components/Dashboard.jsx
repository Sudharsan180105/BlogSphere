import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import axios from "axios";

import {

  Activity, ArrowUpRight, BookOpen, Check, Clock3, Edit3, FilePlus2,

  Globe2, LayoutDashboard, LogOut, Menu, Plus, Search, Send, Trash2,

  X, Eye, PenLine, RefreshCw, Sparkles, MoreHorizontal,

  ChevronRight, Image as ImageIcon,

  WandSparkles, Flame, CalendarDays, Heart, Hash,
  Settings, Save, UserCircle2, ImagePlus

} from "lucide-react";

import "./Dashboard.css";



const API = import.meta.env.VITE_API_URL || "/api";

const emptyForm = {

  title: "", excerpt: "", content: "", category: "Technology",

  tags: "", coverImage: "", status: "draft",

};



function initials(name = "BlogSphere Member") {

  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

}



function ProfileAvatar({ user, size = "normal" }) {

  const [imageFailed, setImageFailed] = useState(false);

  const avatar = user?.avatar || user?.photoURL || user?.picture;

  return (

    <div className={`bs-avatar bs-avatar-${size}`}>

      {avatar && !imageFailed

        ? <img src={avatar} alt="" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} />

        : <span>{initials(user?.name || user?.email || "Writer")}</span>}

    </div>

  );

}



export default function Dashboard({ user, onLogout }) {

  const [blogs, setBlogs] = useState([]);

  const [publicBlogs, setPublicBlogs] = useState([]);

  const [activeTab, setActiveTab] = useState("overview");

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [notice, setNotice] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [selectedBlog, setSelectedBlog] = useState(null);

  const [mobileMenu, setMobileMenu] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const [editorPreview, setEditorPreview] = useState(false);
  const [discoverSearch, setDiscoverSearch] = useState("");
  const [discoverCategory, setDiscoverCategory] = useState("All stories");
  const [discoverSort, setDiscoverSort] = useState("newest");
  const [discoverSortOpen, setDiscoverSortOpen] = useState(false);
  const [readerProgress, setReaderProgress] = useState(0);
  const [shareNotice, setShareNotice] = useState("");
  const readerScrollRef = useRef(null);
  const [profileUser, setProfileUser] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    avatar: user?.avatar || user?.photoURL || user?.picture || "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileNotice, setProfileNotice] = useState("");

  const currentUser = profileUser || user;



  const token = localStorage.getItem("blogsphere_token") || sessionStorage.getItem("blogsphere_token");

  const api = useMemo(() => axios.create({

    baseURL: API,

    headers: token ? { Authorization: `Bearer ${token}` } : {},

  }), [token]);



  const loadBlogs = useCallback(async () => {

    setLoading(true);

    setError("");

    try {

      const [mine, published] = await Promise.all([api.get("/blogs/mine"), api.get("/blogs")]);

      setBlogs(mine.data.blogs || []);

      setPublicBlogs(published.data.blogs || []);

    } catch (err) {

      setError(err.response?.data?.message || "Unable to load articles. Please try again.");

    } finally {

      setLoading(false);

    }

  }, [api]);



  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBlogs();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadBlogs]);



  const publishedCount = blogs.filter((blog) => blog.status === "published").length;

  const draftCount = blogs.filter((blog) => blog.status === "draft").length;

  const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);

  const editorWordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;

  const editorReadingTime = Math.max(1, Math.ceil(editorWordCount / 200));

  const filteredBlogs = blogs.filter((blog) => {

    const text = `${blog.title} ${blog.excerpt} ${blog.category} ${(blog.tags || []).join(" ")}`.toLowerCase();

    return text.includes(search.toLowerCase()) && (filter === "all" || blog.status === filter);

  });

  const discoverCategories = ["All stories", ...new Set(publicBlogs.map((blog) => blog.category).filter(Boolean).sort((a, b) => a.localeCompare(b)))];
  const discoverResults = publicBlogs
    .filter((blog) => {
      const searchable = `${blog.title || ""} ${blog.excerpt || ""} ${blog.category || ""} ${(blog.tags || []).join(" ")} ${blog.author?.name || ""}`.toLowerCase();
      const matchesSearch = searchable.includes(discoverSearch.trim().toLowerCase());
      const matchesCategory = discoverCategory === "All stories" || blog.category === discoverCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (discoverSort === "popular") return (b.views || 0) - (a.views || 0);
      if (discoverSort === "title") return (a.title || "").localeCompare(b.title || "");
      return new Date(b.createdAt || b.updatedAt || 0).getTime() - new Date(a.createdAt || a.updatedAt || 0).getTime();
    });
  const featuredDiscoverBlog = discoverResults[0] || null;
  const remainingDiscoverBlogs = discoverResults.slice(1);



  function openCreate() {

    setEditingId(null); setForm(emptyForm); setError(""); setEditorPreview(false); setEditorOpen(true);

  }

  function openEdit(blog) {

    setEditingId(blog._id);

    setForm({

      title: blog.title || "", excerpt: blog.excerpt || "", content: blog.content || "",

      category: blog.category || "Technology", tags: (blog.tags || []).join(", "),

      coverImage: blog.coverImage || "", status: blog.status || "draft",

    });

    setError(""); setEditorPreview(false); setEditorOpen(true);

  }

  function updateField(event) {

    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  }

  async function saveBlog(event) {

    event.preventDefault(); setSaving(true); setError(""); setNotice("");

    const payload = { ...form, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) };

    try {

      if (editingId) {

        await api.patch(`/blogs/${editingId}`, payload);

        setNotice("Your story has been updated.");

      } else {

        await api.post("/blogs", payload);

        setNotice(form.status === "published" ? "Your story is now published." : "Draft saved to your studio.");

      }

      setEditorOpen(false); setEditingId(null); setForm(emptyForm); await loadBlogs();

    } catch (err) {

      setError(err.response?.data?.message || "Unable to save your story.");

    } finally { setSaving(false); }

  }

  async function deleteBlog(blog) {

    if (!window.confirm(`Delete "${blog.title}" permanently?`)) return;

    try {

      await api.delete(`/blogs/${blog._id}`);

      setSelectedBlog(null); setNotice("Story deleted."); await loadBlogs();

    } catch (err) { setError(err.response?.data?.message || "Unable to delete this story."); }

  }

  async function viewBlog(blog) {
    setReaderProgress(0);
    setShareNotice("");

    if (blog.status === "draft" && blog.content) {
      setSelectedBlog(blog);
      return;
    }

    try {
      const response = await axios.get(`${API}/blogs/${blog.slug}`);
      setSelectedBlog(response.data.blog);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to open this story.");
    }
  }

  useEffect(() => {
    if (!selectedBlog) return;

    const node = readerScrollRef.current;
    if (!node) return;

    const updateProgress = () => {
      const max = node.scrollHeight - node.clientHeight;
      setReaderProgress(
        max > 0
          ? Math.min(100, Math.round((node.scrollTop / max) * 100))
          : 100
      );
    };

    node.addEventListener("scroll", updateProgress, { passive: true });
    const frameId = window.requestAnimationFrame(updateProgress);

    return () => {
      window.cancelAnimationFrame(frameId);
      node.removeEventListener("scroll", updateProgress);
    };
  }, [selectedBlog]);

  async function shareSelectedBlog() {
    if (!selectedBlog) return;
    const shareText = [selectedBlog.title, selectedBlog.excerpt || "", window.location.href].filter(Boolean).join("\\n\\n");
    try {
      if (navigator.share) {
        await navigator.share({ title: selectedBlog.title, text: shareText });
        setShareNotice("Share sheet opened.");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setShareNotice("Article details copied.");
      } else {
        setShareNotice("Sharing is not available in this browser.");
      }
    } catch (err) {
      if (err?.name !== "AbortError") setShareNotice("Unable to share this article.");
    }
  }

  useEffect(() => {
    if (activeTab !== "settings") return;
    let cancelled = false;

    async function loadProfile() {
      setProfileLoading(true);
      setProfileError("");
      try {
        const response = await api.get("/users/me");
        if (cancelled) return;
        const nextUser = response.data.user;
        setProfileUser(nextUser);
        setProfileForm({
          name: nextUser?.name || "",
          bio: nextUser?.bio || "",
          avatar: nextUser?.avatar || "",
        });
      } catch (err) {
        if (!cancelled) {
          setProfileError(
            err.response?.data?.message || "Unable to load your profile. Please sign in again."
          );
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }

    loadProfile();
    return () => { cancelled = true; };
  }, [activeTab, api]);

  function updateProfileField(event) {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileNotice("");
    try {
      const response = await api.patch("/users/me", {
        name: profileForm.name.trim(),
        bio: profileForm.bio.trim(),
        avatar: profileForm.avatar.trim(),
      });
      const updatedUser = response.data.user;
      setProfileUser(updatedUser);
      setProfileForm({
        name: updatedUser?.name || "",
        bio: updatedUser?.bio || "",
        avatar: updatedUser?.avatar || "",
      });
      setProfileNotice("Your author profile has been updated.");
      setNotice("Profile changes saved successfully.");
    } catch (err) {
      setProfileError(err.response?.data?.message || "Unable to save your profile.");
    } finally {
      setProfileSaving(false);
    }
  }

  const greetingName = currentUser?.name?.trim()?.split(/\s+/)[0] || "Writer";

  const navItems = [

    ["overview", LayoutDashboard, "Overview"],

    ["articles", BookOpen, "My stories"],

    ["discover", Globe2, "Discover"],
    ["settings", Settings, "Profile & settings"],

  ];



  return (

    <main className="bs-dashboard bs-concept-05">

      <div className="bs-noise" />

      <div className="bs-glow bs-glow-a" /><div className="bs-glow bs-glow-b" />

      <aside className={`bs-sidebar ${mobileMenu ? "bs-sidebar-open" : ""}`}>

        <button className="bs-brand" onClick={() => { setActiveTab("overview"); setMobileMenu(false); }}>

          <span className="bs-brand-mark">b<span>.</span></span>

          <span className="bs-brand-name">blog<span>sphere</span></span>

        </button>

        <div className="bs-side-caption">WORKSPACE</div>

        <nav className="bs-nav">

          {navItems.map(([id, Icon, label]) => (

            <button key={id} className={activeTab === id ? "active" : ""}

              onClick={() => { setActiveTab(id); setMobileMenu(false); }}>

              <Icon size={18} /><span>{label}</span>

              {id === "articles" && <small>{blogs.length}</small>}

              {activeTab === id && <i />}

            </button>

          ))}

        </nav>

        <div className="bs-side-divider" />

        <div className="bs-side-caption">QUICK ACTION</div>

        <button className="bs-side-create" onClick={openCreate}><Plus size={17} /> Create a story</button>

        <div className="bs-side-card">

          <div className="bs-side-card-icon"><Sparkles size={17} /></div>

          <span>CREATOR NOTE</span>

          <strong>Your ideas deserve to be seen.</strong>

          <p>Turn a passing thought into something worth sharing.</p>

          <button onClick={openCreate}>Start writing <ArrowUpRight size={14} /></button>

        </div>

        <div className="bs-sidebar-bottom">

          <div className="bs-profile">

            <ProfileAvatar user={currentUser} />

            <div className="bs-profile-info">

              <strong>{currentUser?.name || "BlogSphere Member"}</strong>

              <span title={currentUser?.email || ""}>{currentUser?.email || "Email not available"}</span>

            </div>

            <button className="bs-more" onClick={() => setProfileOpen(!profileOpen)} aria-label="Profile options"><MoreHorizontal size={19} /></button>

          </div>

          {profileOpen && <div className="bs-profile-pop"><strong>{currentUser?.name || "BlogSphere Member"}</strong><span>{currentUser?.email || "Email not available"}</span><button onClick={() => { setActiveTab("settings"); setProfileOpen(false); }}><Settings size={15} /> Profile & settings</button><button onClick={onLogout}><LogOut size={15} /> Sign out</button></div>}

          <button className="bs-logout" onClick={onLogout}><LogOut size={16} /> Sign out</button>

        </div>

      </aside>



      <section className="bs-main">

        <header className="bs-topbar">

          <button className="bs-mobile-menu" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu"><Menu /></button>

          <div className="bs-breadcrumb"><span>YOUR WORKSPACE</span><i>/</i>{activeTab === "overview" ? "OVERVIEW" : activeTab === "articles" ? "MY STORIES" : activeTab === "discover" ? "DISCOVER" : "PROFILE & SETTINGS"}</div>

          <div className="bs-top-actions">

            <div className="bs-system"><i /> <span>STUDIO ONLINE</span></div>

            <button className="bs-top-create" onClick={openCreate}><Plus size={17} /> New story</button>

            <button className="bs-top-profile" onClick={() => setProfileOpen(!profileOpen)}>

              <ProfileAvatar user={currentUser} size="small" />

              <span><strong>{currentUser?.name || "Writer"}</strong><small>{currentUser?.email || "Email not available"}</small></span>

              <ChevronRight size={15} />

            </button>

          </div>

        </header>



        <div className="bs-content">

          {notice && <div className="bs-notice"><Check size={17} />{notice}<button onClick={() => setNotice("")}><X size={16} /></button></div>}

          {error && <div className="bs-error" role="alert">{error}<button onClick={() => setError("")}><X size={16} /></button></div>}



          {activeTab === "overview" && <>

            <section className="bs-hero bs-hero-cinematic">

              <div className="bs-hero-gridline" />

              <div className="bs-hero-copy">

                <span className="bs-eyebrow"><i /> THE INDEPENDENT CREATOR'S CLUB <span className="bs-hero-index">ISSUE 001 / YOUR STUDIO</span></span>

                <h1>Ideas deserve<br /><em>a bigger stage.</em></h1>

                <p className="bs-hero-welcome">Welcome back, <strong>{greetingName}</strong>. A studio for curious minds, bold opinions and stories people remember.</p>

                <div className="bs-hero-actions">

                  <button className="bs-primary" onClick={openCreate}><PenLine size={17} /> Create your next story <ArrowUpRight size={16} /></button>

                  <button className="bs-ghost" onClick={loadBlogs}><RefreshCw size={15} /> Sync studio</button>

                </div>

                <div className="bs-hero-proof"><span><i /> YOUR SPACE IS READY</span><span>WRITE · REFINE · RELEASE</span></div>

              </div>

              <div className="bs-hero-visual">

                <div className="bs-visual-star star-a">✳</div><div className="bs-visual-star star-b">✦</div>

                <div className="bs-visual-star star-c">✧</div><div className="bs-visual-star star-d">✦</div>

                <div className="bs-visual-ring ring-one" /><div className="bs-visual-ring ring-two" /><div className="bs-visual-ring ring-three" />

                <div className="bs-portal-grid" /><div className="bs-portal-aura" />

                <div className="bs-visual-orb"><span>bs<span>.</span></span></div>

                <div className="bs-orbit-satellite satellite-a"><PenLine size={13} /></div>

                <div className="bs-orbit-satellite satellite-b"><Sparkles size={13} /></div>

                <div className="bs-orbit-satellite satellite-c"><Globe2 size={13} /></div>

                <div className="bs-floating-chip chip-one"><PenLine size={14} /> IDEATE</div>

                <div className="bs-floating-chip chip-two"><Globe2 size={14} /> RELEASE</div>

                <div className="bs-visual-label">AN EDITION OF YOUR OWN <b>✦</b></div>

              </div>

              <div className="bs-hero-foot"><span>01</span><i /> YOUR CREATIVE ERA STARTS NOW <span className="bs-hero-foot-right">SCROLL TO EXPLORE ↓</span></div>

            </section>



            <section className="bs-creator-strip">

              <div className="bs-creator-message"><span className="bs-eyebrow">YOUR CREATOR SIGNAL</span><h2>Your voice is<br /><em>the whole point.</em></h2><p>Your studio is your space to experiment, publish and build a body of work that feels unmistakably yours.</p></div>

              <div className="bs-creator-orbit"><div className="bs-orbit-core"><WandSparkles size={25} /></div><span className="orbit-word orbit-word-one">IMAGINE</span><span className="orbit-word orbit-word-two">CREATE</span><span className="orbit-word orbit-word-three">INSPIRE</span></div>

              <div className="bs-creator-quote"><span>THE CREATOR'S NOTE / 001</span><strong>“Don't wait for the perfect idea. Make the first one unforgettable.”</strong><small>— YOUR STUDIO MANIFESTO</small></div>

            </section>



            <div className="bs-section-title"><div><span className="bs-eyebrow">THE NUMBERS BEHIND YOUR IDEAS</span><h2>Your studio <em>pulse.</em></h2></div><span className="bs-live-label"><i /> LIVE FROM YOUR LIBRARY</span></div>

            <div className="bs-stats">

              <Stat icon={BookOpen} label="Stories created" value={blogs.length} detail="Your growing collection" accent="cyan" />

              <Stat icon={Globe2} label="Out in the world" value={publishedCount} detail="Stories published" accent="violet" />

              <Stat icon={PenLine} label="In the workshop" value={draftCount} detail="Ideas taking shape" accent="blue" />

              <Stat icon={Eye} label="Reader moments" value={totalViews} detail="Total story reads" accent="pink" />

            </div>

            <section className="bs-journey-panel">

              <div className="bs-journey-heading"><div><span className="bs-eyebrow">THE MAKING OF A WRITER</span><h2>Your publishing <em>journey.</em></h2></div><span className="bs-journey-stamp"><Flame size={15} /> KEEP THE MOMENTUM</span></div>

              <div className="bs-journey-steps">

                <div className="bs-journey-step is-done"><span className="bs-journey-number">01</span><span className="bs-journey-icon"><PenLine size={18} /></span><strong>Find the spark</strong><small>Capture an idea</small><i /></div>

                <div className={`bs-journey-step ${blogs.length ? "is-done" : ""}`}><span className="bs-journey-number">02</span><span className="bs-journey-icon"><BookOpen size={18} /></span><strong>Shape the story</strong><small>{blogs.length ? `${blogs.length} story${blogs.length === 1 ? "" : "ies"} started` : "Write your first story"}</small><i /></div>

                <div className={`bs-journey-step ${publishedCount ? "is-done" : ""}`}><span className="bs-journey-number">03</span><span className="bs-journey-icon"><Send size={18} /></span><strong>Release it</strong><small>{publishedCount ? `${publishedCount} published` : "Share it with readers"}</small><i /></div>

                <div className={`bs-journey-step ${totalViews ? "is-done" : ""}`}><span className="bs-journey-number">04</span><span className="bs-journey-icon"><Heart size={18} /></span><strong>Make an impact</strong><small>{totalViews} reader visits</small></div>

              </div>

            </section>

            <div className="bs-section-title bs-recent-title"><div><span className="bs-eyebrow">FRESH FROM YOUR WORKSHOP</span><h2>Latest <em>chapters.</em></h2></div><button className="bs-link-button" onClick={() => setActiveTab("articles")}>Explore your library <ArrowUpRight size={16} /></button></div>

            {loading ? <Loading /> : blogs.length ? <BlogGrid blogs={blogs.slice(0, 3)} onEdit={openEdit} onDelete={deleteBlog} onView={viewBlog} /> : <EmptyState onCreate={openCreate} />}

            <div className="bs-bottom-banner"><div className="bs-banner-icon"><WandSparkles size={20} /></div><div><strong>Your next chapter is waiting.</strong><p>Step outside your own draft and find a fresh perspective in the BlogSphere community.</p></div><button onClick={() => setActiveTab("discover")}>Enter the community <ArrowUpRight size={16} /></button></div>

          </>}



          {activeTab === "articles" && <>

            <div className="bs-page-intro bs-page-intro-art"><span className="bs-eyebrow"><i /> YOUR PRIVATE EDITORIAL ARCHIVE</span><h1>Stories in <em>motion.</em></h1><p>A living archive of your ideas, experiments and stories worth sharing.</p><span className="bs-page-orbit">THE LIBRARY / {String(blogs.length).padStart(2, "0")} PIECES</span></div>

            <div className="bs-toolbar"><div className="bs-search"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, topic or category..." /></div><select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All stories</option><option value="published">Published</option><option value="draft">Drafts</option></select><button className="bs-primary" onClick={openCreate}><Plus size={16} /> New story</button></div>

            {loading ? <Loading /> : filteredBlogs.length ? <BlogGrid blogs={filteredBlogs} onEdit={openEdit} onDelete={deleteBlog} onView={viewBlog} /> : <EmptyState onCreate={openCreate} />}

          </>}



          {activeTab === "discover" && <>

            <div className="bs-page-intro bs-page-intro-art bs-discover-intro"><span className="bs-eyebrow"><i /> THE OPEN JOURNAL / COMMUNITY EDITION</span><h1>Worlds beyond <em>your own.</em></h1><p>Explore ideas, meet different perspectives and discover stories from the BlogSphere community.</p><span className="bs-page-orbit">READ · REFLECT · REPEAT</span><div className="bs-discover-intro-foot"><span><Globe2 size={14} /> COMMUNITY LIBRARY</span><span>{publicBlogs.length.toLocaleString()} PUBLISHED STORIES</span></div></div>

            {loading ? <Loading /> : publicBlogs.length ? <>

              <section className="bs-discover-toolbar" aria-label="Discover filters">
                <div className="bs-discover-search"><Search size={18} /><input value={discoverSearch} onChange={(event) => setDiscoverSearch(event.target.value)} placeholder="Search stories, topics, authors..." aria-label="Search community stories" /><span>⌕</span></div>
                <div className={`bs-discover-sort ${discoverSortOpen ? "is-open" : ""}`}>
                  <span className="bs-discover-sort-label">SORT BY</span>
                  <button type="button" className="bs-discover-sort-trigger" aria-haspopup="listbox" aria-expanded={discoverSortOpen} onClick={() => setDiscoverSortOpen((open) => !open)}>
                    {discoverSort === "newest" ? "Newest first" : discoverSort === "popular" ? "Most read" : "Title A–Z"}
                    <ChevronRight size={15} />
                  </button>
                  {discoverSortOpen && <div className="bs-discover-sort-menu" role="listbox" aria-label="Sort stories">
                    {[ ["newest", "Newest first"], ["popular", "Most read"], ["title", "Title A–Z"] ].map(([value, label]) => <button type="button" role="option" aria-selected={discoverSort === value} className={discoverSort === value ? "active" : ""} key={value} onClick={() => { setDiscoverSort(value); setDiscoverSortOpen(false); }}>{label}{discoverSort === value && <Check size={14} />}</button>)}
                  </div>}
                </div>
              </section>

              <div className="bs-discover-categories" aria-label="Filter by category">{discoverCategories.map((category) => <button type="button" key={category} className={discoverCategory === category ? "active" : ""} onClick={() => setDiscoverCategory(category)}>{category}</button>)}</div>

              <div className="bs-discover-results-line"><div><span className="bs-eyebrow">THE COMMUNITY SELECTION</span><h2>Find your next <em>read.</em></h2></div><span>{discoverResults.length} {discoverResults.length === 1 ? "STORY" : "STORIES"} FOUND · {featuredDiscoverBlog ? "1 FEATURED" : "0 FEATURED"}{remainingDiscoverBlogs.length ? ` + ${remainingDiscoverBlogs.length} MORE` : ""}</span></div>

              {featuredDiscoverBlog ? <>
                <article className="bs-discover-featured">
                  <button type="button" className="bs-discover-featured-art" onClick={() => viewBlog(featuredDiscoverBlog)} aria-label={`Read ${featuredDiscoverBlog.title}`}>
                    {featuredDiscoverBlog.coverImage ? <img src={featuredDiscoverBlog.coverImage} alt="" /> : <div className="bs-discover-art-fallback"><span>THE COMMUNITY EDITION</span><strong>01</strong><i>{featuredDiscoverBlog.category || "BLOGSPHERE"} / FEATURED</i></div>}
                    <span className="bs-discover-featured-label"><Sparkles size={13} /> EDITOR'S PICK</span><span className="bs-discover-featured-arrow"><ArrowUpRight size={20} /></span>
                  </button>
                  <div className="bs-discover-featured-copy"><span className="bs-category">{featuredDiscoverBlog.category || "COMMUNITY"} <i /> FEATURED READ</span><h3>{featuredDiscoverBlog.title}</h3><p>{featuredDiscoverBlog.excerpt || "A fresh perspective from the BlogSphere community."}</p><div className="bs-discover-byline"><span className="bs-discover-avatar">{initials(featuredDiscoverBlog.author?.name || "BlogSphere Writer")}</span><span><strong>{featuredDiscoverBlog.author?.name || "BlogSphere Writer"}</strong><small>{featuredDiscoverBlog.readingTime || 1} MIN READ · {(featuredDiscoverBlog.views || 0).toLocaleString()} READS</small></span></div><button type="button" className="bs-primary" onClick={() => viewBlog(featuredDiscoverBlog)}>Read this story <ArrowUpRight size={16} /></button></div>
                </article>
                {remainingDiscoverBlogs.length > 0 && <div className="bs-discover-grid-heading"><span>MORE FROM THE JOURNAL</span><i /></div>}
                {remainingDiscoverBlogs.length > 0 && <BlogGrid blogs={remainingDiscoverBlogs} onView={viewBlog} publicMode />}
              </> : <div className="bs-discover-empty"><Search size={23} /><h3>No stories found</h3><p>Try another search term or choose a different category.</p><button type="button" onClick={() => { setDiscoverSearch(""); setDiscoverCategory("All stories"); }}>Clear filters</button></div>}

            </> : <EmptyState onCreate={openCreate} community />}

          </>}

          {activeTab === "settings" && <>
            <section className="bs-page-intro bs-page-intro-art bs-profile-intro">
              <span className="bs-eyebrow"><i /> YOUR CREATOR IDENTITY</span>
              <h1>Your voice. <em>Your profile.</em></h1>
              <p>Shape the author identity readers see across your BlogSphere journey.</p>
              <span className="bs-page-orbit">ACCOUNT / AUTHOR SETTINGS</span>
            </section>

            {profileError && <div className="bs-error" role="alert">{profileError}</div>}
            {profileNotice && <div className="bs-notice" role="status"><Check size={16} />{profileNotice}</div>}

            {profileLoading ? <Loading /> : <>
              <div className="bs-profile-layout">
                <section className="bs-profile-preview-card">
                  <div className="bs-profile-preview-glow" />
                  <span className="bs-eyebrow">AUTHOR PREVIEW / LIVE</span>
                  <div className="bs-profile-preview-avatar">
                    {profileForm.avatar
                      ? <img src={profileForm.avatar} alt="Profile preview" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                      : <span>{initials(profileForm.name || currentUser?.email || "Writer")}</span>}
                  </div>
                  <h2>{profileForm.name.trim() || "Your name"}</h2>
                  <p>{currentUser?.email || "Email not available"}</p>
                  <div className="bs-profile-preview-bio">{profileForm.bio.trim() || "Your author bio will appear here. Tell readers what inspires your work."}</div>
                  <div className="bs-profile-preview-meta">
                    <span><BookOpen size={14} /> {publishedCount} published stories</span>
                    <span><CalendarDays size={14} /> Member since {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "—"}</span>
                  </div>
                </section>

                <form className="bs-profile-form-card" onSubmit={saveProfile}>
                  <div className="bs-profile-form-heading">
                    <div><span className="bs-eyebrow">PERSONAL DETAILS</span><h2>Make it <em>yours.</em></h2><p>Keep your author information clear, current and recognisable.</p></div>
                    <span className="bs-profile-form-icon"><UserCircle2 size={22} /></span>
                  </div>

                  <label className="bs-profile-field">
                    <span>DISPLAY NAME</span>
                    <input name="name" value={profileForm.name} onChange={updateProfileField} minLength={2} maxLength={50} required placeholder="Your name" />
                    <small>Shown on your author identity. 2–50 characters.</small>
                  </label>

                  <label className="bs-profile-field">
                    <span>AUTHOR BIO</span>
                    <textarea name="bio" value={profileForm.bio} onChange={updateProfileField} maxLength={300} rows={5} placeholder="Write a short introduction for your readers..." />
                    <small>{profileForm.bio.length}/300 characters</small>
                  </label>

                  <label className="bs-profile-field">
                    <span>PROFILE IMAGE URL</span>
                    <div className="bs-profile-url-field"><ImagePlus size={17} /><input name="avatar" type="url" value={profileForm.avatar} onChange={updateProfileField} maxLength={2048} placeholder="https://example.com/your-photo.jpg" /></div>
                    <small>Use a publicly accessible HTTP or HTTPS image URL. Direct file uploads are not enabled yet.</small>
                  </label>

                  <div className="bs-profile-account-row">
                    <div><span>ACCOUNT EMAIL</span><strong>{currentUser?.email || "Email not available"}</strong><small>Email changes are not available in this settings screen.</small></div>
                    <span className="bs-profile-verified"><Check size={13} /> ACCOUNT</span>
                  </div>

                  <footer className="bs-profile-form-footer">
                    <span><i /> Changes save to your BlogSphere account</span>
                    <button className="bs-primary" type="submit" disabled={profileSaving || profileForm.name.trim().length < 2}>
                      {profileSaving ? <Activity className="bs-spin" size={16} /> : <Save size={16} />}
                      {profileSaving ? "Saving profile..." : "Save changes"}
                    </button>
                  </footer>
                </form>
              </div>
            </>}
          </>}

        </div>

      </section>



      {editorOpen && <div className="bs-modal-backdrop bs-writing-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) setEditorOpen(false); }}>

        <form className="bs-editor bs-writing-studio" onSubmit={saveBlog}>

          <header className="bs-studio-header">

            <div className="bs-studio-brand"><span className="bs-studio-mark">b.</span><div><span className="bs-eyebrow">BLOGSPHERE / CREATOR STUDIO</span><h2>{editingId ? "Shape your story." : "Make something worth reading."}</h2><p>Your ideas deserve a thoughtful place to take form.</p></div></div>

            <div className="bs-studio-header-actions">

              <span className="bs-studio-save-state"><i /> {saving ? "SAVING CHANGES" : "EDITOR READY"}</span>

              <button type="button" className="bs-icon-button" onClick={() => setEditorOpen(false)} disabled={saving} aria-label="Close writing studio"><X /></button>

            </div>

          </header>



          <div className="bs-studio-meta-line">

            <span><PenLine size={14} /> WRITING DESK</span><span className="bs-studio-meta-dot" /><span>{editorWordCount.toLocaleString()} WORDS</span><span className="bs-studio-meta-dot" /><span>{editorReadingTime} MIN READ</span>

          </div>



          <div className="bs-editor-layout">

            <section className="bs-editor-main">

              <label className="bs-studio-field bs-title-field"><span>STORY TITLE</span><input name="title" value={form.title} onChange={updateField} minLength={3} maxLength={120} required placeholder="A title that makes people curious..." /></label>

              <label className="bs-studio-field bs-excerpt-field"><span>THE DECK / SHORT DESCRIPTION</span><textarea name="excerpt" value={form.excerpt} onChange={updateField} maxLength={300} required rows={2} placeholder="A single thought that invites readers into your story..." /></label>



              <div className="bs-writing-canvas">

                <div className="bs-writing-toolbar">

                  <div className="bs-writing-toolbar-label"><span className="bs-toolbar-pulse" /> MANUSCRIPT</div>

                  <div className="bs-writing-view-switch"><button type="button" className={!editorPreview ? "active" : ""} onClick={() => setEditorPreview(false)}><PenLine size={13} /> Write</button><button type="button" className={editorPreview ? "active" : ""} onClick={() => setEditorPreview(true)}><Eye size={13} /> Preview</button></div>

                </div>

                {editorPreview ? <div className="bs-live-preview">

                  {form.coverImage && <img className="bs-live-preview-cover" src={form.coverImage} alt="Article cover preview" onError={(e) => { e.currentTarget.style.display = "none"; }} />}

                  <span className="bs-eyebrow">{form.category || "YOUR CATEGORY"} · {editorReadingTime} MIN READ</span>

                  <h3>{form.title || "Your story title will appear here"}</h3>

                  <p className="bs-live-preview-excerpt">{form.excerpt || "Your short description will appear here."}</p>

                  <div className="bs-live-preview-content">{form.content || "Your story will appear here as you write..."}</div>

                </div> : <textarea className="bs-writing-area bs-manuscript" name="content" value={form.content} onChange={updateField} minLength={10} required rows={16} placeholder={"Begin with the thought you cannot stop thinking about...\n\nLet the story unfold, one paragraph at a time."} />}

                <div className="bs-writing-canvas-foot"><span> <Sparkles size={13} /> YOUR VOICE. YOUR PACE.</span><span>{form.content.length.toLocaleString()} CHARACTERS</span></div>

              </div>

            </section>



            <aside className="bs-editor-aside">

              <div className="bs-publish-card">

                <div className="bs-aside-heading"><span className="bs-eyebrow">RELEASE CONTROL</span><span className="bs-publish-status">{form.status === "published" ? "PUBLIC" : "PRIVATE"}</span></div>

                <h3>{form.status === "published" ? "Ready for readers?" : "Keep shaping it."}</h3>

                <p>{form.status === "published" ? "Your story will be available to the BlogSphere community." : "Save your progress privately and return whenever inspiration strikes."}</p>

                <label className="bs-studio-field"><span>PUBLICATION STATUS</span><select name="status" value={form.status} onChange={updateField}><option value="draft">Save as draft</option><option value="published">Publish story</option></select></label>

                <div className="bs-publish-facts"><span><Clock3 size={14} /> {editorReadingTime} min reading time</span><span><BookOpen size={14} /> {editorWordCount} words</span></div>

              </div>



              <div className="bs-publish-card bs-details-card">

                <div className="bs-aside-heading"><span className="bs-eyebrow">STORY DETAILS</span><Hash size={15} /></div>

                <label className="bs-studio-field"><span>CATEGORY</span><select name="category" value={form.category} onChange={updateField}>{["Technology", "Design", "Business", "Lifestyle", "Education", "Travel", "General"].map((item) => <option key={item}>{item}</option>)}</select></label>

                <label className="bs-studio-field"><span>TOPICS / TAGS</span><input name="tags" value={form.tags} onChange={updateField} placeholder="React, Design, Technology" /></label>

              </div>



              <div className="bs-publish-card bs-cover-card">

                <div className="bs-aside-heading"><span className="bs-eyebrow">COVER ART</span><ImageIcon size={15} /></div>

                <div className="bs-cover-preview">{form.coverImage ? <img src={form.coverImage} alt="Cover preview" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <div className="bs-cover-empty"><ImageIcon size={24} /><span>YOUR STORY'S FIRST IMPRESSION</span></div>}</div>

                <label className="bs-studio-field"><span>IMAGE URL <small>OPTIONAL</small></span><input name="coverImage" type="url" value={form.coverImage} onChange={updateField} placeholder="https\://..." /></label>

              </div>

            </aside>

          </div>



          {error && <div className="bs-error">{error}</div>}

          <footer className="bs-studio-footer">

            <div className="bs-studio-footer-note"><span className="bs-footer-orbit" /><span>TAKE YOUR TIME. MAKE IT MATTER.</span></div>

            <div className="bs-editor-actions"><button type="button" className="bs-cancel" onClick={() => setEditorOpen(false)} disabled={saving}>Discard session</button><button type="submit" className="bs-primary" disabled={saving}>{saving ? <Activity className="bs-spin" size={17} /> : form.status === "published" ? <Send size={16} /> : <Check size={16} />}{saving ? "Saving..." : editingId ? "Save changes" : form.status === "published" ? "Publish story" : "Save draft"}</button></div>

          </footer>

        </form>

      </div>}



      {selectedBlog && (
        <div className="bs-reader-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedBlog(null);
        }}>
          <article className="bs-reader-page" aria-label="Article reader">
            <div className="bs-reader-progress-track" aria-hidden="true">
              <span style={{ width: `${readerProgress}%` }} />
            </div>

            <header className="bs-reader-nav">
              <button className="bs-reader-wordmark" onClick={() => setSelectedBlog(null)} aria-label="Back to BlogSphere">
                <span className="bs-reader-brand-mark">b.</span>
                <span>blog<span>sphere</span></span>
              </button>
              <div className="bs-reader-nav-actions">
                <span className="bs-reader-progress-label">{readerProgress}% COMPLETE</span>
                <button className="bs-reader-close" onClick={() => setSelectedBlog(null)} aria-label="Close article"><X size={20} /></button>
              </div>
            </header>

            <div className="bs-reader-scroll" ref={readerScrollRef}>
              <div className="bs-reader-inner">
                <section className="bs-reader-intro">
                  <div className="bs-reader-intro-copy">
                    <div className="bs-reader-kicker">
                      <span>{selectedBlog.category || "General"}</span>
                      <i />
                      <span>{selectedBlog.readingTime || 1} MIN READ</span>
                    </div>
                    <h1 className="bs-reader-title">{selectedBlog.title}</h1>
                    {selectedBlog.excerpt && <p className="bs-reader-deck">{selectedBlog.excerpt}</p>}
                    <div className="bs-reader-byline">
                      <div className="bs-reader-author-avatar">
                        {(selectedBlog.author?.name || currentUser?.name || "B").trim().charAt(0).toUpperCase()}
                      </div>
                      <div className="bs-reader-author-copy">
                        <strong>{selectedBlog.author?.name || currentUser?.name || "BlogSphere author"}</strong>
                        <span>Author · {selectedBlog.readingTime || 1} minute read</span>
                      </div>
                      <button className="bs-reader-share" onClick={shareSelectedBlog}>
                        <ArrowUpRight size={15} /> Share story
                      </button>
                    </div>
                  </div>
                  <aside className="bs-reader-edition-card">
                    <span className="bs-reader-edition-label">BLOGSPHERE / EDITION</span>
                    <span className="bs-reader-edition-number">01</span>
                    <span className="bs-reader-edition-rule" />
                    <span className="bs-reader-edition-caption">A story, told in your own words.</span>
                    <span className="bs-reader-edition-orbit" />
                  </aside>
                </section>

                {selectedBlog.coverImage && (
                  <figure className="bs-reader-hero-image">
                    <img src={selectedBlog.coverImage} alt={selectedBlog.title ? `${selectedBlog.title} cover` : "Article cover"} />
                    <figcaption>{selectedBlog.category || "BLOGSPHERE JOURNAL"}</figcaption>
                  </figure>
                )}

                <div className="bs-reader-reading-layout">
                  <aside className="bs-reader-side-note">
                    <span className="bs-reader-side-index">THE READING ROOM</span>
                    <strong>Make space for a new perspective.</strong>
                    <small>Settle in, follow the thought and take the story at your own pace.</small>
                    <div className="bs-reader-side-progress"><span style={{ width: `${readerProgress}%` }} /></div>
                    <small>{readerProgress}% of this story explored</small>
                  </aside>
                  <div className="bs-reader-content">
                    {(selectedBlog.content || "").split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => (
                      <p key={index}>{paragraph.trim()}</p>
                    ))}
                  </div>
                </div>

                <footer className="bs-reader-end">
                  <span className="bs-reader-end-line" />
                  <span>END OF STORY</span>
                  <span className="bs-reader-end-line" />
                </footer>

                <div className="bs-reader-bottom-actions">
                  <span><Eye size={15} /> {selectedBlog.views || 0} reads</span>
                  <button onClick={shareSelectedBlog}><ArrowUpRight size={15} /> Share story</button>
                  <button onClick={() => setSelectedBlog(null)}>Return to library <ChevronRight size={15} /></button>
                </div>
                {shareNotice && <p className="bs-reader-share-notice" role="status">{shareNotice}</p>}
              </div>
            </div>
          </article>
        </div>
      )}

    </main>

  );

}



function Stat({ icon: Icon, label, value, detail, accent }) {

  return <div className={`bs-stat stat-${accent}`}><div className="bs-stat-top"><span>{label}</span><span className="bs-stat-icon"><Icon size={18} /></span></div><strong>{value}</strong><small>{detail}</small><div className="bs-stat-line" /></div>;

}

function BlogGrid({ blogs, onEdit, onDelete, onView, publicMode = false }) {

  return <div className="bs-blog-grid">{blogs.map((blog, index) => <article className="bs-blog-card" key={blog._id} style={{ "--card-index": index }}>

    <button className="bs-blog-cover" onClick={() => onView(blog)} aria-label={`Read ${blog.title}`}>

      {blog.coverImage ? <img src={blog.coverImage} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <div className="bs-cover-placeholder"><span className="bs-cover-mark">b.</span><span>BLOGSPHERE / JOURNAL</span></div>}

      <span className="bs-cover-sheen" /><span className="bs-cover-index">ISSUE / {String(index + 1).padStart(2, "0")}</span>

      <span className={`bs-status ${blog.status || "published"}`}>{blog.status || "published"}</span><span className="bs-cover-open"><ArrowUpRight size={17} /></span>

    </button>

    <div className="bs-blog-body"><span className="bs-category">{blog.category || "General"}</span><h3>{blog.title}</h3><p>{blog.excerpt}</p><div className="bs-blog-meta"><span><Clock3 size={13} /> {blog.readingTime || 1} min read</span><span><Eye size={13} /> {blog.views || 0} reads</span></div>

      <div className="bs-blog-actions"><button onClick={() => onView(blog)}><Eye size={14} /> Read</button>{!publicMode && <><button onClick={() => onEdit(blog)}><Edit3 size={14} /> Edit</button><button className="bs-delete-action" onClick={() => onDelete(blog)} aria-label="Delete story"><Trash2 size={14} /></button></>}</div>

    </div>

  </article>)}</div>;

}

function EmptyState({ onCreate, community = false }) {

  return <div className="bs-empty"><div className="bs-empty-icon">{community ? <Globe2 size={26} /> : <FilePlus2 size={26} />}</div><h3>{community ? "The community is ready for your voice." : "Your next story starts here."}</h3><p>{community ? "Publish your first article and introduce your perspective to BlogSphere." : "You haven't created any stories here yet. Start with one idea."}</p><button onClick={onCreate}><Plus size={16} /> {community ? "Write the first story" : "Create a story"}</button></div>;

}

function Loading() { return <div className="bs-loading"><span className="bs-loading-orbit" /><span>Loading your stories...</span></div>; }
