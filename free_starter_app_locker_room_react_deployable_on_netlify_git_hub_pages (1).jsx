import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Plus, Users, Trophy, Calendar, Upload, Play } from "lucide-react";

// Minimal, single-file React app you can deploy for free.
// Features:
// - Landing page
// - Simple join form with localStorage persistence
// - Announcements and Events boards (editable in-session)
// - Resource links section (videos, PDFs, external)
// - Pseudo-auth for "admin" mode using a shared pin (stored in memory only)
// - Clean, mobile-first UI with shadcn/ui + Tailwind
//
// How to use:
// 1) Click the Admin switch (top right) and set any 4-digit pin to enable editing.
// 2) Add announcements, events, and resources.
// 3) Export data as a JSON file (Settings tab) then re-import later.
// 4) Deploy free on Netlify or GitHub Pages (instructions provided in chat).

const seedAnnouncements = [
  { id: 1, text: "Welcome to The Locker Room — a private space for former athletes to connect, grow, and thrive.", createdAt: Date.now() - 1000 * 60 * 60 * 24 },
  { id: 2, text: "Next virtual session: Tuesday 4 to 5 PM and Thursday 12 to 1 PM.", createdAt: Date.now() - 1000 * 60 * 60 * 2 },
];

const seedEvents = [
  { id: 1, title: "Accountability Kickoff", date: new Date().toISOString().slice(0,10), location: "Virtual", description: "Meet the squad and set weekly goals." },
  { id: 2, title: "Beyond The Game Workshop", date: new Date(Date.now() + 1000*60*60*24*7).toISOString().slice(0,10), location: "Virtual", description: "Identity, clarity, and next steps beyond sports." },
];

const seedResources = [
  { id: 1, title: "Daily 5 Habits Tracker (PDF)", url: "#" },
  { id: 2, title: "Book List for High Performers", url: "#" },
  { id: 3, title: "Schedule a 1:1", url: "https://calendly.com/raisethevibes/collaboration-meeting" },
];

const seedProducts = [
  { id: 1, kind: "digital", title: "Beyond The Game Playbook (PDF)", price: 29, description: "A step by step workbook to regain clarity, build momentum, and reset your habits.", cta: "Buy now", link: "#" },
  { id: 2, kind: "coaching", title: "1 on 1 Clarity Call – 60 min", price: 0, description: "Free intro session to map your goals and next steps.", cta: "Book call", link: "https://calendly.com/jevon-a-brown-simpson/information-call-resume-review" },
  { id: 3, kind: "coaching", title: "Beyond The Game – 4 Week", price: 2500, description: "Four weeks of high touch coaching, weekly sessions, and a personalized plan.", cta: "Apply", link: "#" }
];

function useLocalState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState];
}

export default function App() {
  const [adminPin, setAdminPin] = useState("");
  const [adminSet, setAdminSet] = useState(false);
  const isAdmin = useMemo(() => adminSet && adminPin.length === 4, [adminPin, adminSet]);

  const [members, setMembers] = useLocalState("lr_members", []);
  const [announcements, setAnnouncements] = useLocalState("lr_announcements", seedAnnouncements);
  const [events, setEvents] = useLocalState("lr_events", seedEvents);
  const [resources, setResources] = useLocalState("lr_resources", seedResources);
  const [products, setProducts] = useLocalState("lr_products", seedProducts);
  const [showApply, setShowApply] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [webhookUrl, setWebhookUrl] = useLocalState("lr_webhook", ""); // Google Apps Script Web App URL

  function handleJoin(member) {
    setMembers((m) => [{ id: Date.now(), ...member }, ...m]);
  }

  function exportAll() {
    const data = { members, announcements, events, resources };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `locker-room-export-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importAll(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.members) setMembers(data.members);
        if (data.announcements) setAnnouncements(data.announcements);
        if (data.events) setEvents(data.events);
        if (data.resources) setResources(data.resources);
      } catch {}
    };
    reader.readAsText(file);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className="text-sm">Raise The Vibes</Badge>
            <h1 className="text-xl md:text-2xl font-semibold">The Locker Room</h1>
          </div>
          <div className="flex items-center gap-2">
            {!adminSet ? (
              <div className="flex items-center gap-2">
                <Input placeholder="Set 4-digit admin pin" maxLength={4} value={adminPin} onChange={(e)=>setAdminPin(e.target.value.replace(/\D/g, "").slice(0,4))} className="w-40"/>
                <Button onClick={()=> setAdminSet(true)} variant="secondary">Admin</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant={isAdmin?"default":"secondary"}>{isAdmin?"Admin On":"Admin Locked"}</Badge>
                <Button onClick={()=> { setAdminSet(false); setAdminPin(""); }} variant="ghost">Exit</Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <Hero onJoin={handleJoin} />

        <Tabs defaultValue="announcements" className="w-full">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="announcements"><Users className="w-4 h-4 mr-2"/>Community</TabsTrigger>
            <TabsTrigger value="events"><Calendar className="w-4 h-4 mr-2"/>Events</TabsTrigger>
            <TabsTrigger value="store"><Trophy className="w-4 h-4 mr-2"/>Products</TabsTrigger>
            <TabsTrigger value="resources"><Play className="w-4 h-4 mr-2"/>Resources</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="announcements">
            <Board
              title="Announcements"
              items={announcements}
              isAdmin={isAdmin}
              onAdd={(text)=> setAnnouncements((list)=> [{ id: Date.now(), text, createdAt: Date.now() }, ...list])}
              onDelete={(id)=> setAnnouncements((list)=> list.filter(i=> i.id!==id))}
            />
            <Members members={members} />
          </TabsContent>

          <TabsContent value="events">
            <Events
              items={events}
              isAdmin={isAdmin}
              onAdd={(event)=> setEvents((list)=> [{ id: Date.now(), ...event }, ...list])}
              onDelete={(id)=> setEvents((list)=> list.filter(i=> i.id!==id))}
            />
          </TabsContent>

          <TabsContent value="store">
            <Products
              items={products}
              isAdmin={isAdmin}
              onAdd={(p)=> setProducts((list)=> [{ id: Date.now(), ...p }, ...list])}
              onDelete={(id)=> setProducts((list)=> list.filter(i=> i.id!==id))}
              onApply={(program)=> { setSelectedProgram(program); setShowApply(true); }}
            />
          </TabsContent>

          <TabsContent value="resources">
            <Resources
              items={resources}
              isAdmin={isAdmin}
              onAdd={(res)=> setResources((list)=> [{ id: Date.now(), ...res }, ...list])}
              onDelete={(id)=> setResources((list)=> list.filter(i=> i.id!==id))}
            />
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>Backup and Restore</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button onClick={exportAll} className="flex items-center gap-2"><Upload className="w-4 h-4"/>Export JSON</Button>
                  <label className="text-sm text-slate-600">Save a copy of your data</label>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="file" accept="application/json" onChange={(e)=> e.target.files && importAll(e.target.files[0])} />
                </div>
                <hr className="my-4"/>
                <div className="space-y-2">
                  <h3 className="font-medium">Google Sheets connection</h3>
                  <p className="text-sm text-slate-600">Paste your Google Apps Script Web App URL. New signups will be sent to your Sheet.</p>
                  <div className="flex gap-2">
                    <Input placeholder="https://script.google.com/.../exec" value={webhookUrl} onChange={(e)=> setWebhookUrl(e.target.value)} />
                  </div>
                </div>
                <p className="text-sm text-slate-500">This demo stores data in your browser using localStorage. For real accounts connect a backend later.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {showApply && (
          <ApplicationForm open={showApply} onClose={()=> setShowApply(false)} program={selectedProgram} />
        )}
      </main>

      <footer className="py-10 text-center text-sm text-slate-500">
        Built with love for former athletes. © {new Date().getFullYear()} Raise The Vibes
      </footer>
    </div>
  );
}

function Hero({ onJoin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [story, setStory] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error

  // access webhook from localStorage so Hero does not need prop drilling
  const [webhookUrl] = useLocalState("lr_webhook", "");

  async function submit() {
    if (!name || !email) return;
    setStatus("sending");

    const member = { name, email, story, ts: new Date().toISOString(), source: "locker-room-app" };
    onJoin(member);

    try {
      if (webhookUrl) {
        // Send as application/x-www-form-urlencoded to avoid CORS preflight
        const body = new URLSearchParams(member).toString();
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
          mode: "cors",
        });
      }
      setStatus("done");
      setName("");
      setEmail("");
      setStory("");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 items-stretch">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">A community for former athletes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">Stay connected to your competitive edge with structure, accountability, and a reason to show up every day.</p>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4"/>Weekly workshops</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4"/>Exclusive events</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4"/>1 on 1 coaching</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4"/>Daily challenges</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Join for free</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {status === "done" ? (
            <div className="text-green-700">Thanks for joining. Check your inbox for next steps.</div>
          ) : status === "error" ? (
            <div className="text-red-700">Saved locally. There was a problem sending to the Sheet. Try again later.</div>
          ) : (
            <>
              <Input placeholder="Full name" value={name} onChange={(e)=> setName(e.target.value)} />
              <Input type="email" placeholder="Email" value={email} onChange={(e)=> setEmail(e.target.value)} />
              <Textarea placeholder="Share a bit about you and your sport background" value={story} onChange={(e)=> setStory(e.target.value)} />
              <Button onClick={submit} disabled={status === "sending"} className="w-full flex items-center gap-2">
                <Users className="w-4 h-4"/>{status === "sending" ? "Submitting..." : "Join now"}
              </Button>
              <p className="text-xs text-slate-500">Info is saved locally and optionally sent to your Google Sheet when connected.</p>
            </>
          )} />
              <Input type="email" placeholder="Email" value={email} onChange={(e)=> setEmail(e.target.value)} />
              <Textarea placeholder="Share a bit about you and your sport background" value={story} onChange={(e)=> setStory(e.target.value)} />
              <Button onClick={submit} className="w-full flex items-center gap-2"><Users className="w-4 h-4"/>Join now</Button>
              <p className="text-xs text-slate-500">Your info is saved in your browser only until a backend is added.</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Board({ title, items, onAdd, onDelete, isAdmin }) {
  const [text, setText] = useState("");
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {isAdmin && (
            <div className="flex gap-2">
              <Input placeholder="Write an announcement" value={text} onChange={(e)=> setText(e.target.value)} />
              <Button onClick={()=> { if(text.trim()) { onAdd(text.trim()); setText(""); } }} className="flex items-center gap-2"><Plus className="w-4 h-4"/>Add</Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && <p className="text-sm text-slate-500">Nothing yet. Check back soon.</p>}
        {items.map((a)=> (
          <div key={a.id} className="p-3 border rounded-xl flex items-start justify-between">
            <p className="pr-3">{a.text}</p>
            {isAdmin && <Button variant="ghost" onClick={()=> onDelete(a.id)}>Delete</Button>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Events({ items, onAdd, onDelete, isAdmin }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  return (
    <div className="space-y-4">
      {isAdmin && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Add event</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-2">
            <Input placeholder="Title" value={title} onChange={(e)=> setTitle(e.target.value)} />
            <Input type="date" value={date} onChange={(e)=> setDate(e.target.value)} />
            <Input placeholder="Location" value={location} onChange={(e)=> setLocation(e.target.value)} />
            <div className="md:col-span-4 grid grid-cols-1 gap-2">
              <Textarea placeholder="Description" value={description} onChange={(e)=> setDescription(e.target.value)} />
              <Button onClick={()=> { if(title && date) { onAdd({ title, date, location, description }); setTitle(""); setDate(""); setLocation(""); setDescription(""); } }} className="w-full flex items-center gap-2"><Calendar className="w-4 h-4"/>Save event</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((e)=> (
          <Card key={e.id} className="shadow-sm">
            <CardHeader>
              <CardTitle>{e.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Date:</strong> {e.date}</p>
              <p><strong>Location:</strong> {e.location}</p>
              {e.description && <p className="text-slate-600">{e.description}</p>}
              {isAdmin && <Button variant="ghost" onClick={()=> onDelete(e.id)}>Delete</Button>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Products({ items, onAdd, onDelete, isAdmin, onApply }) {
  const [kind, setKind] = useState("digital");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [cta, setCta] = useState("Buy now");

  return (
    <div className="space-y-4">
      {isAdmin && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Add product or coaching package</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-5 gap-2">
            <select className="border rounded-md p-2" value={kind} onChange={(e)=> setKind(e.target.value)}>
              <option value="digital">Digital product</option>
              <option value="coaching">Coaching package</option>
            </select>
            <Input placeholder="Title" value={title} onChange={(e)=> setTitle(e.target.value)} />
            <Input type="number" placeholder="Price (USD)" value={price} onChange={(e)=> setPrice(e.target.value)} />
            <Input placeholder="CTA label (Buy now / Book call / Apply)" value={cta} onChange={(e)=> setCta(e.target.value)} />
            <Input placeholder="Checkout or booking link" value={link} onChange={(e)=> setLink(e.target.value)} />
            <div className="md:col-span-5 grid gap-2">
              <Textarea placeholder="Short description" value={description} onChange={(e)=> setDescription(e.target.value)} />
              <Button onClick={()=> { if(title && link) { onAdd({ kind, title, price: Number(price)||0, description, link, cta }); setTitle(""); setPrice(""); setDescription(""); setLink(""); } }} className="w-full flex items-center gap-2"><Plus className="w-4 h-4"/>Save</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {items.map((p)=> (
          <Card key={p.id} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{p.title}</span>
                {p.price !== 0 && <Badge>${p.price}</Badge>}
                {p.price === 0 && <Badge variant="secondary">Free</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-slate-600">{p.description}</p>
              {(p.cta && p.cta.toLowerCase() === "apply") ? (
              <Button className="w-full" onClick={()=> onApply(p)}>Apply</Button>
            ) : (
              <a href={p.link} target="_blank" rel="noreferrer">
                <Button className="w-full">{p.cta || (p.kind === "coaching" ? "Book call" : "Buy now")}</Button>
              </a>
            )}
              {isAdmin && <Button variant="ghost" onClick={()=> onDelete(p.id)}>Delete</Button>}
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-slate-500">Tip: Use Stripe Payment Links for digital products and Calendly links for coaching. No code required.</p>
    </div>
  );
}

function ApplicationForm({ open, onClose, program }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [goals, setGoals] = useState("");
  const [status, setStatus] = useState("idle");
  const [webhookUrl] = useLocalState("lr_webhook", "");

  if (!open) return null;

  async function submit() {
    if (!name || !email) return;
    setStatus("sending");
    const payload = {
      type: "application",
      program: program?.title || "",
      name, email, phone, goals,
      ts: new Date().toISOString(),
    };
    try {
      if (webhookUrl) {
        const body = new URLSearchParams(payload).toString();
        await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, mode: "cors" });
      }
      setStatus("done");
      setName(""); setEmail(""); setPhone(""); setGoals("");
    } catch(e){ console.error(e); setStatus("error"); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Apply for {program?.title}</h3>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        {status === "done" ? (
          <div className="text-green-700">Thanks. Your application was received. We will reach out shortly.</div>
        ) : (
          <>
            <div className="grid gap-2">
              <Input placeholder="Full name" value={name} onChange={(e)=> setName(e.target.value)} />
              <Input type="email" placeholder="Email" value={email} onChange={(e)=> setEmail(e.target.value)} />
              <Input placeholder="Phone (optional)" value={phone} onChange={(e)=> setPhone(e.target.value)} />
              <Textarea placeholder="What are your goals for this program?" value={goals} onChange={(e)=> setGoals(e.target.value)} />
            </div>
            <Button className="w-full" onClick={submit} disabled={status === "sending"}>{status === "sending" ? "Submitting..." : "Submit application"}</Button>
          </>
        )}
      </div>
    </div>
  );
}

function Resources({ items, onAdd, onDelete, isAdmin }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  return (
    <div className="space-y-4">
      {isAdmin && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Add resource</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-2">
            <Input placeholder="Title" value={title} onChange={(e)=> setTitle(e.target.value)} />
            <Input placeholder="URL" value={url} onChange={(e)=> setUrl(e.target.value)} />
            <Button onClick={()=> { if(title && url) { onAdd({ title, url }); setTitle(""); setUrl(""); } }} className="flex items-center gap-2"><Plus className="w-4 h-4"/>Save</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((r)=> (
          <Card key={r.id} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{r.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <a href={r.url} target="_blank" rel="noreferrer" className="underline">Open</a>
              {isAdmin && <Button variant="ghost" onClick={()=> onDelete(r.id)} className="ml-2">Delete</Button>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
