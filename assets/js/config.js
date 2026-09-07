/* ============================================================================
   config.js  —  THE ONLY FILE YOU NEED TO EDIT.
   Everything on your site is generated from the values below.
   Anything left as "" (empty string) is automatically hidden from the page.

   ⚠️  STILL TO FILL IN — search for "TODO" in this file:
       · analytics.goatcounter — your GoatCounter code (README step 4)
       · links.instagram   — or leave "" and it disappears from the site
       · repo: ""          — on the 4 projects that have no GitHub repo yet
   ========================================================================= */

const CONFIG = {

  /* ---------------------------------------------------------------------
     1. WHO YOU ARE
     ------------------------------------------------------------------ */
  identity: {
    name:        "Saahil Darisipudi",
    role:        "Machine Learning Engineer · M.S. AI/ML at Saint Louis University",
    building:    ["computer vision models", "satellite imagery pipelines", "ML demos you can actually use"],
    bio:         "I'm an M.S. student in Artificial Intelligence & Machine Learning at Saint Louis University (GPA 3.74), with two years at Kyndryl monitoring 110+ enterprise applications across AWS and Azure. My work centres on computer vision and geospatial machine learning — satellite imagery pipelines, change detection, and models deployed as demos rather than left in notebooks. Several of those projects run live on this page; press Run demo and try them.",
    location:    "Saint Louis, Missouri",
    availability: { status: "open", label: "Open to ML/AI roles · Graduating Dec 2026" }
  },


  /* ---------------------------------------------------------------------
     2. LINKS  —  set to "" to hide any of these
     ------------------------------------------------------------------ */
  links: {
    linkedin:    "https://www.linkedin.com/in/saahil-darisipudi-2a88b2217",
    github:      "https://github.com/Saahil-doryu",
    huggingface: "https://huggingface.co/Saahil-doryu",
    instagram:   "",                                              // TODO (or leave blank to hide)
    email:       "darisipudisaahil91@gmail.com",
    phone:       "+1 (314) 305-4810",
    // true = hidden behind a "tap to reveal" button (cuts down scraper spam)
    phoneProtected: true
  },


  /* ---------------------------------------------------------------------
     3. RESUME
     ------------------------------------------------------------------ */
  resume: {
    enabled:      true,
    file:         "resume/resume.pdf",
    filename:     "Saahil-Darisipudi-Resume.pdf",
    inlineViewer: true,
    lastUpdated:  "September 2026"
  },


  /* ---------------------------------------------------------------------
     4. SKILLS  —  taken from your resume
     ------------------------------------------------------------------ */
  skills: [
    { group: "Programming",          items: ["Python", "Java", "SQL", "HTML", "CSS"] },
    { group: "Machine Learning",     items: ["Deep Learning", "Computer Vision", "NLP", "Transfer Learning", "Change Detection"] },
    { group: "Frameworks & Libraries", items: ["PyTorch", "NumPy", "Pandas", "Rasterio", "Xarray", "Dask", "Gradio"] },
    { group: "Tools & Platforms",    items: ["AWS", "Azure", "Datadog", "Git", "Hugging Face", "STAC", "MS Planetary Computer"] },
    { group: "Concepts",             items: ["Object-Oriented Programming", "IoT", "Cloud Monitoring", "Data Structures"] }
  ],


  /* ---------------------------------------------------------------------
     5. PROJECTS
        demo.type: "space" (Hugging Face) | "iframe" (any app) | "none"
        Demos load only when a visitor clicks "Run demo".
     ------------------------------------------------------------------ */
  projects: [
    {
      title:    "Warfarin Dose Prediction System",
      tagline:  "End-to-end clinical dosing model, deployed and runnable",
      description: "An end-to-end system that predicts patient warfarin dose from clinical and demographic features, comparing KNN, Random Forest, Gradient Boosting and Neural Networks under cross-validated evaluation. Preprocessing and model selection are wired into a Gradio app deployed on Hugging Face, so the whole pipeline runs on live input rather than a saved notebook.",
      tags:     ["Python", "scikit-learn", "Neural Networks", "Gradio", "Hugging Face"],
      featured: true,
      repo:     "",                                                // TODO: add GitHub repo
      live:     "https://huggingface.co/spaces/Saahil-doryu/warfarin-dose-predictor",
      demo: {
        type:   "space",
        // ⚠️ This Space is currently in "Runtime error" state on Hugging Face.
        //    Restart it (Space → Settings → Factory reboot) before you share this site.
        url:    "https://saahil-doryu-warfarin-dose-predictor.hf.space",
        height: 660,
        hint:   "Enter patient details and the model predicts a warfarin dose in real time."
      }
    },
    {
      title:    "Wildfire Detection from Satellite Imagery",
      tagline:  "18,000+ ML-ready tiles from raw Sentinel-2 scenes",
      description: "A satellite-imagery preprocessing pipeline built for wildfire detection: scene validation, cloud filtering, CRS-aware reprojection and 6-band 224×224 tiling. It generated over 18,000 image tiles across 10 wildfire scenarios, written as Cloud-Optimised GeoTIFFs so downstream training reads only the bytes it needs.",
      tags:     ["Rasterio", "Xarray", "Dask", "STAC", "MS Planetary Computer", "NumPy"],
      featured: true,
      repo:     "",                                                // TODO: add GitHub repo
      live:     "https://huggingface.co/datasets/Saahil-doryu/active-fire-sentinel2",
      demo: { type: "none" }
    },
    {
      title:    "Satellite Image Change Detection",
      tagline:  "Ongoing — spotting what changed between two dates",
      description: "A deep-learning change-detection pipeline that identifies differences between multi-temporal satellite images of the same location. Covers imagery preprocessing, image alignment and registration, and change-detection modelling for remote-sensing applications.",
      tags:     ["PyTorch", "Remote Sensing", "Computer Vision", "Image Registration"],
      featured: false,
      repo:     "https://github.com/Saahil-doryu/satellite-image-change-detection",
      live:     "",
      demo: { type: "none" }
    },
    {
      title:    "Clothing Classification under Noisy Labels",
      tagline:  "Learning from a dataset where the labels are wrong",
      description: "Image classification on Clothing1M, a benchmark whose labels are deliberately noisy, using nested co-teaching so two networks filter each other's mistakes instead of memorising them. Deployed as a Gradio Space that classifies an uploaded garment image.",
      tags:     ["PyTorch", "Noisy Labels", "Co-teaching", "Gradio"],
      featured: false,
      repo:     "",                                                // TODO: add GitHub repo
      live:     "https://huggingface.co/spaces/Saahil-doryu/Clothing1m",
      demo: {
        type:   "space",
        url:    "https://saahil-doryu-clothing1m.hf.space",
        height: 620,
        hint:   "Upload a photo of a garment and the model identifies the clothing type."
      }
    },
    {
      title:    "Flowers102 — Fine-Grained Image Classification",
      tagline:  "102 flower species from a single photo",
      description: "A convolutional classifier trained to distinguish 102 visually similar flower species. Used transfer learning from ResNet and VGG backbones with data augmentation to reach high multi-class accuracy on a fine-grained problem where classes differ only in small details.",
      tags:     ["PyTorch", "Transfer Learning", "ResNet", "VGG", "Data Augmentation"],
      featured: false,
      repo:     "",                                                // TODO: add GitHub repo
      live:     "",
      demo: { type: "none" }
    },
    {
      title:    "ClearPass AI — Interview Practice Tool",
      tagline:  "Spoken mock interviews with session analytics",
      description: "A desktop interview-practice application with a Java Swing GUI built on CardLayout, integrating the Gemini API for question generation and EdgeTTS so prompts are spoken aloud. Session data models track questions, answers and summary analytics across a practice run.",
      tags:     ["Java", "Swing", "Gemini API", "EdgeTTS"],
      featured: false,
      repo:     "https://github.com/Saahil-doryu/ClearpassAI",
      live:     "",
      demo: { type: "none" }
    }
  ],


  /* ---------------------------------------------------------------------
     6. EXPERIENCE & EDUCATION
     ------------------------------------------------------------------ */
  experience: [
    {
      role:    "Graduate Representative",
      org:     "Kyndryl Solutions Pvt. Ltd.",
      period:  "Aug 2023 — Jan 2025",
      points: [
        "Monitored 110+ enterprise applications across Datadog, AWS and Azure, cutting downtime through proactive incident alerting.",
        "Partnered with CBRE Global D&T to optimise cloud system performance.",
        "Supported project management and client service delivery across the engagement."
      ]
    }
  ],

  education: [
    {
      degree: "M.S. in Artificial Intelligence & Machine Learning",
      org:    "Saint Louis University",
      period: "Expected Dec 2026",
      detail: "GPA 3.74/4.0 · Coursework: Machine Learning, Artificial Intelligence, Object-Oriented Programming in Java"
    },
    {
      degree: "B.Tech in Electronics & Communication Engineering",
      org:    "Aditya Engineering College, Surampalem",
      period: "Apr 2023",
      detail: "GPA 7.26/10 · Coursework: Embedded Systems, IoT, Computer Networks, Data Structures"
    }
  ],


  /* ---------------------------------------------------------------------
     7. SEEING WHO VISITS                          (README step 4)

     ── EASY (recommended) ──────────────────────────────────────────────
     GoatCounter. Free, no card, no command line, about 3 minutes:

       1. Go to https://www.goatcounter.com/signup
       2. Pick a code — say "saahil". That becomes saahil.goatcounter.com
       3. Settings → tick "Allow adding visitor counter to your website"
          (this is what lets the number show on your page)
       4. Put that code below, then commit and push.

     Your dashboard at https://<code>.goatcounter.com is private to your
     login and shows every visit: country, referrer, browser, screen size,
     and timestamps. Resume downloads and demo launches show up there too,
     as events. Visitors to your site only ever see the number.
     ------------------------------------------------------------------ */
  analytics: {
    goatcounter: "",     // ← just your code, e.g. "saahil"

    /* ── ADVANCED (optional, ignore unless you want it) ────────────────
       Self-hosted counter on Cloudflare, which puts the full visitor log
       on the page itself behind an owner key instead of on someone else's
       dashboard. Setup: worker/setup.sh. If goatcounter above is set,
       this is ignored.
       --------------------------------------------------------------- */
    apiUrl: ""
  },


  /* ---------------------------------------------------------------------
     8. SITE
     ------------------------------------------------------------------ */
  site: {
    url:         "https://saahil-doryu.github.io/",
    title:       "Saahil Darisipudi — Machine Learning Engineer",
    description: "M.S. AI/ML student at Saint Louis University building computer vision and geospatial ML systems. Live, runnable project demos.",
    themeDefault: "dark",
    accent:       "violet",
    footerNote:   "Built and deployed by me — source on GitHub."
  }
};

/* Makes CONFIG visible to the rest of the site. Don't remove this line. */
window.CONFIG = CONFIG;
