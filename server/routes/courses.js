import express from 'express';

const router = express.Router();

const mockCourses = [
  {
    id: "hsc-physics-complete",
    title: "এইচএসসি পদার্থবিজ্ঞান ১ম ও ২য় পত্র কমপ্লিট একাডেমি (HSC Physics)",
    slug: "hsc-physics-complete",
    price: 1850,
    regular_price: 2500,
    description: "ভেক্টর, গতিবিদ্যা, নিউটনিয়ান বলবিদ্যা, কাজ-শক্তি-ক্ষমতা, স্থির তড়িৎ ও আধুনিক পদার্থবিজ্ঞানের প্রতিটি অধ্যায়ের বেসিক কনসেপ্ট, সিকিউ এবং বুয়েট-মেডিকেল প্রাক-প্রস্তুতি।",
    thumbnail_url: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=1200&auto=format&fit=crop",
    category: "hsc",
    duration: "১০ ঘণ্টা",
    total_classes: "৩৯টি",
    lesson_count: 39,
    status: "published",
  },
  {
    id: "buet-engineering-admission",
    title: "বুয়েট ও ইঞ্জিনিয়ারিং এডমিশন কমপ্লিট প্রস্তুতি কোর্স",
    slug: "buet-engineering-admission",
    price: 3200,
    regular_price: 4500,
    description: "বুয়েট, কুয়েট, রুয়েট ও চুয়েট ভর্তি পরীক্ষার জন্য পদার্থবিজ্ঞান, রসায়ন ও উচ্চতর গণিতের কনসেপ্ট ক্লিয়ারিং, অ্যাডভান্সড প্রবলেম সলভিং এবং প্রশ্নব্যাংক অ্যানালাইসিস।",
    thumbnail_url: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1200&auto=format&fit=crop",
    category: "admission",
    duration: "২৮ ঘণ্টা",
    total_classes: "৪৮টি",
    lesson_count: 48,
    status: "published",
  },
];

// GET /api/courses
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let results = [...mockCourses];

  if (category && category !== 'all') {
    results = results.filter((c) => c.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }

  return res.json(results);
});

// GET /api/courses/:id
router.get('/:id', (req, res) => {
  const course = mockCourses.find((c) => c.id === req.params.id || c.slug === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  return res.json(course);
});

export default router;
