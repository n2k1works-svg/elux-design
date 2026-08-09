import re

with open('/home/z/my-project/src/app/page.tsx', 'r') as f:
    content = f.read()

# Find the start of ProjectFormModal
start_marker = '/* ---------- Project Form Modal ---------- */'
start_idx = content.index(start_marker)

# Find the end of the function (closing }); after the return JSX)
# The function ends with a pattern like: \n  );\n}\n\n/* ----------
end_pattern = '\n/* ---------- Admin Testimonials Tab ---------- */'
end_idx = content.index(end_pattern)

old_modal = content[start_idx:end_idx]

new_modal = '''/* ---------- Project Form Modal ---------- */
function ProjectFormModal({ project, onClose, onSaved, onError }: {
  project: ProjectT | null;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const [title, setTitle] = useState(project?.title || "");
  const [location, setLocation] = useState(project?.location || "");
  const [category, setCategory] = useState(project?.category || "");
  const [description, setDescription] = useState(project?.description || "");
  const [image, setImage] = useState(project?.image || "");
  const [images, setImages] = useState<string[]>(project?.images || []);
  const [order, setOrder] = useState(project?.order ?? 0);
  const [active, setActive] = useState(project?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 15 * 1024 * 1024;

  const isEdit = !!project;

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    const validFiles = fileArr.filter(f => {
      if (!f.type.startsWith("image/")) { onError(f.name + " is not an image."); return false; }
      if (f.size > MAX_FILE_SIZE) { onError(f.name + " is too large (" + (f.size/1024/1024).toFixed(1) + "MB). Max 15MB per image."); return false; }
      return true;
    });
    if (validFiles.length === 0) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of validFiles) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const r = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await r.json();
        if (!r.ok) { onError(data.error || ("Failed to upload " + file.name)); continue; }
        newUrls.push(data.url);
        if (!image) setImage(data.url);
      } catch { onError("Failed to upload " + file.name); }
    }
    if (newUrls.length > 0) setImages(prev => [...prev, ...newUrls]);
    setUploading(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (image === prev[index]) setImage(next[0] || "");
      return next;
    });
  };

  const setPrimaryImage = (index: number) => {
    setImage(images[index]);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title || !location || !category || !description) {
      onError("All fields are required.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("location", location);
      fd.append("category", category);
      fd.append("description", description);
      fd.append("image", image || "/project-1.png");
      fd.append("images", JSON.stringify(images));
      fd.append("order", String(order));
      fd.append("active", String(active));

      const url = isEdit ? ("/api/projects/" + project!.id) : "/api/projects";
      const method = isEdit ? "PUT" : "POST";
      const r = await fetch(url, { method, body: fd });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      onSaved();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="liquid-glass-strong rounded-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto admin-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-[#0A0A0A]/80 backdrop-blur-md px-6 py-4 border-b border-[rgba(201,168,76,0.1)] flex items-center justify-between">
          <h3 className="font-display text-xl font-light text-[#F5F0E8]">
            {isEdit ? "Edit Project" : "New Project"}
          </h3>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full liquid-glass-subtle flex items-center justify-center text-[#C9A84C] hover:bg-[rgba(201,168,76,0.18)] transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <AdminField label="Title">
              <input className={adminInputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Fantasy Island Villa" required />
            </AdminField>
            <AdminField label="Location">
              <input className={adminInputCls} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Fantasy Island, Fiji" required />
            </AdminField>
          </div>
          <AdminField label="Category">
            <input className={adminInputCls} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Luxury Waterfront Residence" required />
          </AdminField>
          <AdminField label="Description">
            <textarea className={\"\$\{adminInputCls\} resize-none\"} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Project description..." required />
          </AdminField>

          {/* Images: upload multiple */}
          <AdminField label="Project Images" hint="Upload multiple images (max 15MB each). First uploaded is the primary image. Drag & drop or click to browse.">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={\"relative border-2 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer transition-all \$\{dragOver ? \"border-[#C9A84C] bg-[rgba(201,168,76,0.08)]\" : \"border-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.4)]\"}\"}
            >
              <div className="py-2">
                <svg className="w-8 h-8 mx-auto text-[#C9A84C]/60 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                <p className="text-xs text-[#8A8478]">{uploading ? "Uploading..." : "Drop images here or click to browse (multiple)"}</p>
                <p className="text-[0.65rem] text-[#8A8478]/60 mt-1">Max 15MB per image. PNG, JPG, WEBP, GIF, SVG.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {/* Image gallery preview */}
            {images.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#C9A84C]">{images.length} image{images.length > 1 ? "s" : ""} uploaded</p>
                  <p className="text-[0.6rem] text-[#8A8478]">Star = primary</p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className={\"relative group rounded-lg overflow-hidden aspect-square \$\{img === image ? 'ring-2 ring-[#C9A84C]' : ''}\"}>
                      <img src={img} alt={\"Image \$\{i+1}\"} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                        <button type="button" onClick={(e) => { e.stopPropagation(); setPrimaryImage(i); }} className={\"w-7 h-7 rounded-full flex items-center justify-center transition-all \$\{img === image ? 'text-[#C9A84C]' : 'text-white/70 hover:text-[#C9A84C]'}\"} aria-label="Set as primary">
                          <svg className="w-4 h-4" fill={img === image ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(i); }} className="w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-red-400 transition-all" aria-label="Remove image">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      {img === image && <div className="absolute top-1 left-1 text-[#C9A84C]"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-2 flex gap-2">
              <input
                className={\"\$\{adminInputCls\} flex-1 text-xs\"}
                placeholder="Or paste primary image URL here..."
                value={image.startsWith("http") || image.startsWith("/") ? image : ""}
                onChange={(e) => setImage(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setImage("/project-1.png")}
                className="text-[0.65rem] px-3 py-2 rounded-lg border border-[rgba(201,168,76,0.2)] text-[#8A8478] hover:text-[#C9A84C] hover:border-[rgba(201,168,76,0.4)] transition-all whitespace-nowrap"
              >
                Reset
              </button>
            </div>
          </AdminField>

          <div className="grid sm:grid-cols-2 gap-4">
            <AdminField label="Display Order" hint="Lower numbers appear first.">
              <input type="number" className={adminInputCls} value={order} onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)} min={0} />
            </AdminField>
            <AdminField label="Visibility">
              <label className="flex items-center gap-3 px-4 py-2.5 rounded-lg liquid-glass-subtle cursor-pointer">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[#C9A84C] w-4 h-4" />
                <span className="text-sm text-[#F5F0E8] font-light">{active ? "Published (visible)" : "Hidden (draft)"}</span>
              </label>
            </AdminField>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[rgba(201,168,76,0.1)]">
            <AdminButton variant="ghost" type="button" onClick={onClose}>Cancel</AdminButton>
            <AdminButton type="submit" disabled={saving || uploading}>
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
            </AdminButton>
          </div>
        </form>
      </div>
    </div>
  );
}

'''

content = content[:start_idx] + new_modal + content[end_idx:]

with open('/home/z/my-project/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Modal replaced successfully')