"""Generate the Traditional Chinese (zh-HK) site under /zh/ from the English pages.

Usage:  python tools/build_zh.py

The English pages are the source of truth. This script copies each one into
zh/, points links and assets at root-absolute paths, flips the language switch,
and swaps English copy for the translations below. It fails loudly if any
translation no longer matches its English source, so after editing English copy,
re-run it and update the matching entry here.

Page <title>, meta tags, alt text and aria-labels are intentionally left in
English for now.
"""

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "zh"

PAGES = [
    "index", "about", "ai-course", "contact", "customers", "others",
    "patient-reacq", "press", "product", "radiology-assistant", "smart-scheduler",
]
PAGE_LINKS = PAGES[1:] + ["ai-typist"]

# Applied to every page, after the page-specific entries.
COMMON = [
    # Navigation
    ('<a href="about">About us</a>', '<a href="about">關於我們</a>'),
    ('Our Solutions <span class="nav-caret"', '我們的方案 <span class="nav-caret"'),
    ('<span>Our Solutions</span>', '<span>我們的方案</span>'),
    ('<a href="radiology-assistant">AI Radiology Report Solution</a>', '<a href="radiology-assistant">AI 放射科報告方案</a>'),
    ('<a href="ai-course">AI Course</a>', '<a href="ai-course">AI 課程</a>'),
    ('<a href="others">Others</a>', '<a href="others">其他方案</a>'),
    ('<a href="customers">Our Customers</a>', '<a href="customers">我們的客戶</a>'),
    ('<a href="press">Press</a>', '<a href="press">媒體報道</a>'),
    ('<a href="contact">Contact us</a></button>', '<a href="contact">聯絡我們</a></button>'),
    ('<a href="contact">Contact</a>', '<a href="contact">聯絡我們</a>'),
    # Shared CTA and section pieces
    ('<span class="cta-button-main">Contact us</span>', '<span class="cta-button-main">聯絡我們</span>'),
    ('<span class="cta-button-sub">for a demo</span>', '<span class="cta-button-sub">預約示範</span>'),
    ('<span class="cta-button-sub">Contact us for a demo</span>', '<span class="cta-button-sub">聯絡我們預約示範</span>'),
    ('<p class="section-kicker">In Practice</p>', '<p class="section-kicker">實際應用</p>'),
    ('<p class="section-kicker">Features & Functions</p>', '<p class="section-kicker">功能特點</p>'),
    ('<h2>Benefits for your clinic</h2>', '<h2>為您的診所帶來的好處</h2>'),
    ('It helped us systematically identify patients due for follow up, with an evidence based approach. '
     "It easily unlocked revenue that we didn't even realise we were missing.",
     '它以實證為本的方法，幫助我們有系統地找出需要跟進的病人，輕鬆釋放了我們從未察覺的收入。'),
    ('&mdash; Leading Medical Clinic Chain, Hong Kong', '&mdash; 香港領先連鎖醫療診所'),
    # Patient ReAcq database widget (home page card + ReAcq hero)
    ('<span>Patient Database</span>', '<span>病人數據庫</span>'),
    ('64,831 records', '64,831 條記錄'),
    ('db-badge--screen">Screening<', 'db-badge--screen">篩查<'),
    ('db-badge--overdue">Overdue<', 'db-badge--overdue">逾期<'),
    # AI Course module cards (home page card + course hero)
    ('Module 01</span>', '單元 01</span>'),
    ('Module 02</span>', '單元 02</span>'),
    ('Module 03</span>', '單元 03</span>'),
    ('Module 04</span>', '單元 04</span>'),
    ('>AI &amp; ML Fundamentals<', '>AI 與機器學習基礎<'),
    ('>Practical Integration<', '>實務整合<'),
    ('Learn more &rarr;', '了解更多 &rarr;'),
]

T = {}

T["index"] = [
    ('<div class="home-pill">HealthTech Solutions Platform</div>', '<div class="home-pill">醫療科技方案平台</div>'),
    ('<h1>Your Partner in<br><span class="accent">Building Better Healthcare</span></h1>',
     '<h1>與您攜手<br><span class="accent">建構更好的醫療服務</span></h1>'),
    ('We help Healthcare Providers leverage the power of AI to improve the efficiency, capacity and quality of '
     'healthcare operations and services — so you can care for and connect with your patients better.',
     '我們協助醫療服務提供者善用 AI 的力量，提升醫療營運及服務的效率、容量與質素，讓您更好地照顧病人，與病人建立更緊密的聯繫。'),
    ('Explore solutions &rarr;', '探索方案 &rarr;'),
    ('<a href="contact">Book a demo</a>', '<a href="contact">預約示範</a>'),
    ('<div class="home-pill">Our Solutions</div>', '<div class="home-pill">我們的方案</div>'),
    ('<h2>AI-powered tools built for healthcare providers.</h2>', '<h2>專為醫療服務提供者打造的 AI 工具。</h2>'),
    ('>Cancer screening eligible<', '>符合癌症篩查資格<'),
    ('>Missed follow-up<', '>錯過覆診<'),
    ('>Eligible for screening<', '>符合篩查資格<'),
    ('<span><strong>36,714</strong> found</span>', '<span>已找到 <strong>36,714</strong> 個</span>'),
    ('Est. <strong>$1.2M</strong>', '估值 <strong>$1.2M</strong>'),
    ('Unlock your patient database to identify and capture hidden opportunities automatically. '
     'Built for primary care, clinic chains and health screening centres.',
     '釋放病人數據庫的潛力，自動識別並把握隱藏的機會。專為基層醫療、連鎖診所及健康檢查中心而設。'),
    ('AI medical assistant created by doctors, built by data scientists, and trusted by patients. '
     'Accurate doctor-patient matching and streamlined clinical flow.',
     '由醫生構思、數據科學家開發、深受病人信賴的 AI 醫療助理。精準配對醫生與病人，簡化臨床流程。'),
    ('A smarter way to generate hospital rosters — automating complex on-call and A&amp;E duty schedules with '
     'fairness, rule-compliance and transparency.',
     '更聰明的醫院排更方式：自動編排複雜的候召及急症室值班更表，公平、合規、透明。'),
    ('<div class="card-title">AI Radiology Report Solution</div>', '<div class="card-title">AI 放射科報告方案</div>'),
    ('Automated clinical documentation — less time on notes, more time for in-depth consultation and meaningful '
     'patient care.',
     '自動化臨床文書處理：減少撰寫記錄的時間，騰出更多時間深入診症，用心照顧病人。'),
    ('>Clinical Use Cases<', '>臨床應用案例<'),
    ('>Responsible AI<', '>負責任的 AI<'),
    ('<div class="card-title">AI Course</div>', '<div class="card-title">AI 課程</div>'),
    ('Upskill your healthcare team with hands-on AI training programs designed by medical and AI professionals.',
     '由醫療及 AI 專業人士設計的實踐型 AI 培訓課程，助您的醫療團隊提升技能。'),
    ('<div class="card-title">Others</div>', '<div class="card-title">其他方案</div>'),
    ("Not every healthcare workflow fits a standard product. We design custom tools and solutions tailored to our "
     "clients' specific challenges.",
     '並非所有醫療工作流程都適用標準產品。我們因應客戶的具體挑戰，度身設計專屬工具及方案。'),
    ('<div class="home-pill">About us</div>', '<div class="home-pill">關於我們</div>'),
    ('<h2>Empowering providers to revolutionise healthcare</h2>', '<h2>助醫療服務提供者革新醫療</h2>'),
    ('Founded in 2023 by two friends — one a doctor, one a patient — who witnessed first-hand the systemic issues '
     'in our healthcare system and the opportunities that AI could bring. At Rapport AI Medical, our mission is to '
     'build better healthcare for all by empowering providers with specialised AI-driven solutions that connect '
     'patients, streamline operations, and deliver powerful data insights.',
     'Rapport AI Medical 由兩位朋友於 2023 年創立：一位是醫生，一位是病人。他們親身見證了醫療體系中的系統性問題，'
     '以及 AI 可以帶來的機遇。我們的使命是透過專門的 AI 方案賦能醫療服務提供者，連繫病人、精簡營運、提供有力的數據洞察，'
     '為所有人建構更好的醫療服務。'),
    ('Learn more about us &rarr;', '進一步了解我們 &rarr;'),
    ("<h3>Let's make healthcare better together</h3>", '<h3>攜手讓醫療服務變得更好</h3>'),
    ('Preview our solutions using your own patient data — no commitment required.',
     '以您自己的病人數據預覽我們的方案，無需任何承諾。'),
    ('Contact us for a demo &rarr;', '聯絡我們預約示範 &rarr;'),
]

T["about"] = [
    ('<p class="about-hero-eyebrow">About us</p>', '<p class="about-hero-eyebrow">關於我們</p>'),
    ('<h1>Building the future<br>of healthcare <span>with AI.</span></h1>',
     '<h1>以 AI 建構<br>醫療的<span>未來。</span></h1>'),
    ("We're on a mission to make healthcare<br>more intuitive, accessible and efficient<br>for everyone.",
     '我們的使命是讓醫療服務<br>對每個人都更直觀、更容易獲得<br>及更有效率。'),
    ('<span>Our Founding Story</span>', '<span>我們的創業故事</span>'),
    ('<h2><span>On a Mission to Build </span><span class="about-story-accent">Better Healthcare</span></h2>',
     '<h2><span>致力建構</span><span class="about-story-accent">更好的醫療服務</span></h2>'),
    ('&ldquo;As patients and practitioners, we have all personally experienced the inefficiencies of our '
     'healthcare system.&rdquo;',
     '「作為病人及醫護人員，我們都曾親身經歷醫療體系的低效之處。」'),
    ('Founded in 2023, Rapport AI Medical has been on a <strong>mission</strong> to help make healthcare better for '
     'both providers and patients.',
     'Rapport AI Medical 於 2023 年成立，<strong>使命</strong>是為醫療服務提供者和病人帶來更好的醫療體驗。'),
    ('We work with healthcare and insurance providers to build <strong>customisable, AI-powered integration '
     'solutions</strong> that digitalise, streamline and enhance the medical care process at every level.',
     '我們與醫療及保險機構合作，打造<strong>可度身定制、由 AI 驅動的整合方案</strong>，在每個層面將醫療流程數碼化、精簡化並加以提升。'),
    ('By leveraging AI and technology, we aim to <strong>empower healthcare providers</strong> to improve capacity, '
     'quality and efficiency&mdash;while giving patients better access, experiences and outcomes. We believe '
     'healthcare can be intuitive, accessible and efficient.',
     '我們善用 AI 及科技，<strong>賦能醫療服務提供者</strong>提升服務容量、質素和效率，同時讓病人獲得更便捷的服務、'
     '更好的體驗及治療成果。我們相信，醫療服務可以直觀、容易獲得且高效。'),
    ('<h2>Our Values</h2>', '<h2>我們的價值觀</h2>'),
    ('<h3>Safety and Security</h3>', '<h3>安全與保障</h3>'),
    ('We design every solution to support patient wellbeing while protecting sensitive health information with '
     'privacy and security at its core.',
     '我們設計的每個方案都以病人福祉為本，並以私隱和安全為核心，保護敏感的健康資料。'),
    ('<h3>Integrity</h3>', '<h3>誠信</h3>'),
    ('We act with honesty, transparency and accountability.', '我們以誠實、透明和負責任的態度行事。'),
    ('<h3>Innovation</h3>', '<h3>創新</h3>'),
    ('We embrace AI and technology to solve real-world problems.', '我們擁抱 AI 及科技，解決現實世界的問題。'),
    ('<h3>Partnership</h3>', '<h3>夥伴關係</h3>'),
    ('We grow together with our customers and community.', '我們與客戶及社區共同成長。'),
    ('Our mission is to create a healthcare ecosystem that is <strong>smarter, more connected and human.</strong>',
     '我們的使命是創建一個<strong>更智能、更緊密連繫、更具人情味</strong>的醫療生態系統。'),
    ('<span>Founded</span>', '<span>成立年份</span>'),
    ('<span>Healthcare Partners</span>', '<span>醫療合作夥伴</span>'),
    ('<strong>AI-Powered</strong><span>Integration Solutions</span>', '<strong>AI 驅動</strong><span>整合方案</span>'),
    ('<strong>Hong Kong</strong><span>Proudly Rooted</span>', '<strong>香港</strong><span>植根本地</span>'),
]

T["contact"] = [
    ('<h1 id="contact-title">Contact us</h1>', '<h1 id="contact-title">聯絡我們</h1>'),
    ('If you are interested in partnering with us, testing our platform features or have any questions, please do '
     'not hesitate to reach out. Your feedback is what keeps us working hard to make healthcare better each step '
     'along the way.',
     '如果您有興趣與我們合作、試用我們的平台功能，或有任何疑問，歡迎隨時與我們聯絡。您的意見是推動我們努力不懈、一步步讓醫療服務變得更好的動力。'),
    ('<h2>Email us</h2>', '<h2>電郵聯絡</h2>'),
    ('For general enquiries, partnerships or product questions, email our team.',
     '如有一般查詢、合作建議或產品問題，歡迎電郵至我們的團隊。'),
    ('<h2>Let’s connect</h2>', '<h2>保持聯繫</h2>'),
    ('Follow us for the latest product updates and company news.', '關注我們，獲取最新產品資訊及公司動態。'),
    ('<h2>Partnerships &amp; collaboration</h2>', '<h2>夥伴合作</h2>'),
    ('Interested in partnering with us or exploring how our solutions can support your organisation?',
     '有興趣與我們合作，或想了解我們的方案如何支援您的機構？'),
    ('>Start a conversation<', '>開始對話<'),
    ('<strong>We care about your time</strong>Our team will get back to you as soon as possible.',
     '<strong>我們重視您的時間</strong>我們的團隊會盡快回覆您。'),
]

T["customers"] = [
    ('<h1>Our Customers</h1>', '<h1>我們的客戶</h1>'),
    ("We provide a range of customised solutions and implementation options tailored to our clients' specific needs.",
     '我們提供一系列度身定制的方案及實施選項，切合客戶的具體需要。'),
    ('We work with leading medical clinics, hospitals, medical colleges, and health centres. '
     '<a href="contact">Reach out to our team</a> for a chat to explore a solution for you.',
     '我們與領先的醫療診所、醫院、醫學院及健康中心合作。歡迎<a href="contact">聯絡我們的團隊</a>，一同探討適合您的方案。'),
]

T["others"] = [
    ('<h2 class="product-name">Other Solutions</h2>', '<h2 class="product-name">其他方案</h2>'),
    ("<h1>Let's make healthcare better together.</h1>", '<h1>攜手讓醫療服務變得更好。</h1>'),
    ('Not every healthcare workflow fits into a standard product. We work with our clients to design custom tools '
     'and solutions tailored to their specific needs. If you have any particular challenges or pain points, do not '
     'hesitate to reach out - we would be happy to explore how we can support you.',
     '並非所有醫療工作流程都適用標準產品。我們與客戶合作，因應其具體需要度身設計專屬工具及方案。'
     '如果您遇到任何特定挑戰或痛點，歡迎隨時聯絡我們，我們樂意與您探討如何提供支援。'),
    ('>Describe your challenge</a>', '>講述您的挑戰</a>'),
    ("We'll work with you to develop a solution specific for your use case.",
     '我們會與您合作，為您的使用場景開發專屬方案。'),
    ('<h3>Your Problem</h3>', '<h3>您的問題</h3>'),
    ('<p>A specific challenge in your workflow</p>', '<p>工作流程中的具體挑戰</p>'),
    ('<h3>Custom Solution</h3>', '<h3>定制方案</h3>'),
    ('<p>Built around your data and team</p>', '<p>圍繞您的數據和團隊打造</p>'),
    ('<h3>Outcome</h3>', '<h3>成果</h3>'),
    ('<p>Measurable improvement in your clinic</p>', '<p>為您的診所帶來可量度的改善</p>'),
    ('<h2>Examples of what we can build.</h2>', '<h2>我們可以打造的方案例子。</h2>'),
    ('<h3>Custom patient engagement workflows</h3>', '<h3>定制病人互動流程</h3>'),
    ('<h3>Internal clinical decision support tools</h3>', '<h3>內部臨床決策支援工具</h3>'),
    ('<h3>Data extraction and analysis pipelines</h3>', '<h3>數據擷取及分析流程</h3>'),
    ('<h3>Workflow automation for specific departments</h3>', '<h3>特定部門的工作流程自動化</h3>'),
    ('<h3>Integrations across fragmented healthcare systems</h3>', '<h3>整合分散的醫療系統</h3>'),
    ('<h2>When this is relevant.</h2>', '<h2>適用情況。</h2>'),
    ('<h3>Your workflow is inefficient or overly dependent on manual steps</h3>', '<h3>您的工作流程效率低，或過度依賴人手操作</h3>'),
    ('<h3>You have specific operational challenges</h3>', '<h3>您面對特定的營運挑戰</h3>'),
    ('<h3>You need integration across multiple systems</h3>', '<h3>您需要整合多個系統</h3>'),
    ('<h3>You are exploring new AI-enabled workflows</h3>', '<h3>您正在探索新的 AI 工作流程</h3>'),
    ('<h2>Built with healthcare providers.</h2>', '<h2>與醫療服務提供者攜手打造。</h2>'),
    ('<p>Designed around real clinical workflows.</p>', '<p>圍繞真實臨床工作流程設計。</p>'),
    ('<p>Built with flexibility for different systems and environments.</p>', '<p>靈活適應不同系統和環境。</p>'),
    ('<p>Focused on practical, deployable solutions.</p>', '<p>專注於實用、可部署的方案。</p>'),
    ('<p>Developed jointly by a team of medical professionals and AI/tech experts.</p>',
     '<p>由醫療專業人員與 AI／科技專家團隊共同開發。</p>'),
    ('<h2>Describe your challenge.</h2>', '<h2>講述您的挑戰。</h2>'),
]

T["press"] = [
    ('<h1>Press</h1>', '<h1>媒體報道</h1>'),
    ('<h6>In The Press</h6>', '<h6>媒體報道</h6>'),
    ('<h2>Featured In</h2>', '<h2>曾獲報道</h2>'),
    ('Rapport AI Medical featured in Hong Kong Economic Times, showcasing our innovative healthcare AI solutions.',
     '《香港經濟日報》專訪 Rapport AI Medical，介紹我們創新的醫療 AI 方案。'),
    ('>August 2024<', '>2024年8月<'),
    ('>Read article →<', '>閱讀文章 →<'),
    ("ThinkCol's in-depth case study on how Rapport AI Medical is transforming healthcare through AI-powered "
     "solutions.",
     'ThinkCol 深入剖析 Rapport AI Medical 如何以 AI 方案革新醫療服務的案例研究。'),
    ('>Read case study →<', '>閱讀案例研究 →<'),
    ('<h2>Invited to Exhibit Locally and Overseas</h2>', '<h2>獲邀參與本地及海外展覽</h2>'),
]

T["ai-course"] = [
    ('<h2 class="product-name">AI Course</h2>', '<h2 class="product-name">AI 課程</h2>'),
    ('For healthcare organisations interested in learning more about the developments and potential of AI in the '
     'medical industry',
     '適合有意深入了解 AI 在醫療行業的發展與潛力的醫療機構'),
    ('<h1>Equip your healthcare teams to use AI smartly and safely</h1>', '<h1>讓您的醫療團隊聰明而安全地運用 AI</h1>'),
    ('Our AI in Healthcare professional development program increases AI literacy, reduces misuse and compliance '
     'risk, and prepares your organisations for growing role of AI in care delivery.',
     '我們的「醫療 AI」專業發展課程能提升 AI 素養，減少誤用及合規風險，助您的機構為 AI 在醫療服務中日益重要的角色做好準備。'),
    ('>Design a training programme for your team</a>', '>為您的團隊設計培訓課程</a>'),
    ('>Clinical &amp; Operational Use Cases<', '>臨床及營運應用案例<'),
    ('>Data, Risk &amp; Responsible AI<', '>數據、風險與負責任的 AI<'),
    ('<p class="section-kicker">Problem & Outcomes</p>', '<p class="section-kicker">問題與成果</p>'),
    ('<h2>AI adoption is accelerating — but misuse and risk are rising.</h2>',
     '<h2>AI 的應用正在加速，但誤用及風險亦隨之上升。</h2>'),
    ('Healthcare organisations are under pressure to adopt AI, but most teams lack structured, healthcare-specific '
     'training.',
     '醫療機構面對採用 AI 的壓力，但大部分團隊缺乏有系統、針對醫療行業的培訓。'),
    ('<h3>Outcomes</h3>', '<h3>成果</h3>'),
    ('<li>Increase AI literacy.</li>', '<li>提升 AI 素養。</li>'),
    ('<li>Better procurement decisions.</li>', '<li>作出更好的採購決策。</li>'),
    ('<li>Safer clinical usage.</li>', '<li>更安全的臨床應用。</li>'),
    ('<li>Stronger governance.</li>', '<li>更完善的管治。</li>'),
    ('<h2>Modules.</h2>', '<h2>課程單元。</h2>'),
    ('<h3>AI &amp; Machine Learning Fundamentals</h3>', '<h3>AI 與機器學習基礎</h3>'),
    ('Plain-language overview of key AI concepts that matter in healthcare.', '以淺白語言概述與醫療相關的主要 AI 概念。'),
    ('Real-world examples of AI supporting triage, documentation, scheduling, patient engagement, imaging and more.',
     'AI 在分流、文書記錄、排班、病人互動、醫學影像等方面的實際應用例子。'),
    ('How data is used, common risks (bias, overreliance, safety), and responsible use frameworks in healthcare.',
     '數據的使用方式、常見風險（偏差、過度依賴、安全），以及醫療領域中負責任使用 AI 的框架。'),
    ('How to approach implementation, change management and collaboration between clinical, operational and tech '
     'teams.',
     '如何推行實施、管理變革，以及促進臨床、營運與科技團隊之間的協作。'),
    ('<h2>Delivery.</h2>', '<h2>授課形式。</h2>'),
    ('<h3>Live or on-demand</h3>', '<h3>實時或隨選</h3>'),
    ('<h3>Case-based</h3>', '<h3>個案為本</h3>'),
    ('<h3>Customisable</h3>', '<h3>可度身定制</h3>'),
    ('<p class="section-kicker">Audience</p>', '<p class="section-kicker">對象</p>'),
    ('<h2>Designed specifically for healthcare providers and their teams.</h2>', '<h2>專為醫療服務提供者及其團隊而設。</h2>'),
    ('<h3>Doctors and clinicians</h3>', '<h3>醫生及臨床人員</h3>'),
    ('<h3>Executives and decision-makers</h3>', '<h3>管理層及決策者</h3>'),
    ('<h3>Support staff</h3>', '<h3>支援人員</h3>'),
    ('<h2>Built for healthcare professionals.</h2>', '<h2>為醫療專業人員而設。</h2>'),
    ('<p>Developed by experts across medicine, AI and healthcare regulation.</p>',
     '<p>由醫學、AI 及醫療規管領域的專家共同開發。</p>'),
    ("<h2>Upgrade your organisation's AI capability.</h2>", '<h2>提升您機構的 AI 能力。</h2>'),
]

T["patient-reacq"] = [
    ('For primary care practitioners, health screening centres and multi-site clinic groups',
     '適合基層醫療從業員、健康檢查中心及多分店診所集團'),
    ('<h1>Unlock your patient database to identify and capture hidden opportunities automatically.</h1>',
     '<h1>釋放病人數據庫的潛力，自動識別並把握隱藏的機會。</h1>'),
    ('Patient ReAcq is a modular, evidence-based AI program that finds missed health screening and follow-up '
     'opportunities in your past and existing patients, then helps bring them back to your clinic.',
     'Patient ReAcq 是一套模組化、以實證為本的 AI 程式，能從您的過往及現有病人中找出錯失的健康檢查及跟進機會，並協助他們重返您的診所。'),
    ('Used in clinic environments to identify service gaps and untapped opportunities, improve patient care, '
     'screening uptakes and patient follow-up rates.',
     '已應用於診所環境，用以識別服務缺口及未開發的機會，改善病人護理，並提升篩查參與率及病人跟進率。'),
    ('Created by a team of doctors and AI experts with experience in primary &amp; preventive care and health '
     'screening programs, trusted by established clinic chains.',
     '由具備基層及預防醫學、健康檢查計劃經驗的醫生及 AI 專家團隊打造，深受知名連鎖診所信賴。'),
    ("Take control of your clinic's hidden potential", '掌握您診所的隱藏潛力'),
    # Database widget rows (HTML and the inline animation script)
    ('Eligible for Breast Health Screen', '符合乳房健康檢查資格'),
    ('Eligible for Cardio Health Screen', '符合心臟健康檢查資格'),
    ('Osteoporosis review due', '骨質疏鬆覆診到期'),
    ("Women's Health Check recommended", '建議進行女性健康檢查'),
    ('Colorectal Screen due', '大腸篩查到期'),
    ('Eligible for Mammogram Screen', '符合乳房X光造影檢查資格'),
    ('Lipid Profile review due', '血脂檢查覆診到期'),
    ('Diabetes Care Plan due', '糖尿病護理計劃到期'),
    ('Annual Health Check overdue', '年度健康檢查已逾期'),
    ('Eligible for Executive Health Check', '符合行政人員健康檢查資格'),
    ('Cardiac rehab review due', '心臟康復覆診到期'),
    ('Diabetic review outstanding', '糖尿病覆診尚未完成'),
    ('Bone density screening due', '骨質密度檢查到期'),
    ('Postnatal Care Review due', '產後護理覆診到期'),
    ("badgeText: 'Overdue'", "badgeText: '逾期'"),
    ("badgeText: 'Screening'", "badgeText: '篩查'"),
    ('<span><strong>36,714</strong> opportunities found</span>', '<span>已找到 <strong>36,714</strong> 個機會</span>'),
    ('Est. value <strong>$1.2M</strong>', '估計價值 <strong>$1.2M</strong>'),
    ('<h2>Why This Matters</h2>', '<h2>為何重要</h2>'),
    ('Primary care is moving rapidly towards proactive, preventive models, and governments across the region are '
     'pushing for stronger primary care and regular health screening programs. Family medicine and general practice '
     'clinics are in a unique position to be the first line of defence: monitoring risk factors, closing follow-up '
     'gaps and catching issues early. With Patient ReAcq, our goal is to make it easier for clinics to turn good '
     'clinical intentions into systematic, data-driven action. By using AI to surface the right patients at the '
     'right time, we can help you deliver better care to more people, while building a more sustainable business.',
     '基層醫療正迅速邁向主動、以預防為主的模式，區內各地政府亦積極推動加強基層醫療及定期健康檢查計劃。'
     '家庭醫學及普通科診所處於獨特位置，可成為第一道防線：監察風險因素、填補跟進缺口，及早發現問題。'
     '我們希望透過 Patient ReAcq，讓診所更輕鬆地將良好的臨床意願轉化為有系統、以數據為本的行動。'
     '藉著 AI 在適當時候找出合適的病人，我們可以協助您為更多人提供更好的護理，同時建立更可持續的業務。'),
    ('Patient ReAcq helps you identify and re-engage patients suitable for new or existing service opportunities '
     'using an evidence-based and systematic approach.',
     'Patient ReAcq 以實證為本、有系統的方法，協助您識別並重新聯繫適合新服務或現有服務的病人。'),
    ('<h3>Define standards</h3>', '<h3>訂立標準</h3>'),
    ('<h3>Analyse patient data</h3>', '<h3>分析病人數據</h3>'),
    ('<h3>Identify opportunities</h3>', '<h3>識別機會</h3>'),
    ('<h3>Generate outreach</h3>', '<h3>生成外展訊息</h3>'),
    ('<h3>Track engagement</h3>', '<h3>追蹤互動成效</h3>'),
    ('ReAcq helps you uncover new service opportunities within your existing patient base so you can grow, engage '
     'and deliver more value.',
     'ReAcq 協助您在現有病人群中發掘新的服務機會，助您拓展業務、加強病人互動並創造更多價值。'),
    ('>Existing patient base<', '>現有病人群<'),
    ('>Your patient data<', '>您的病人數據<'),
    ('<p>Analyses patterns and identifies service opportunities</p>', '<p>分析規律並識別服務機會</p>'),
    ('>Service opportunities<', '>服務機會<'),
    ('</i>Health screening <b>', '</i>健康檢查 <b>'),
    ('</i>Vaccination <b>', '</i>疫苗接種 <b>'),
    ('</i>Follow-up care <b>', '</i>跟進護理 <b>'),
    ('>Prioritised for impact<', '>按影響力排列優先次序<'),
    ('<h3>More qualified bookings</h3>', '<h3>更多合適的預約</h3>'),
    ('<h3>Earlier patient engagement</h3>', '<h3>更早與病人互動</h3>'),
    ('<h3>Better patient trust</h3>', '<h3>提升病人信任</h3>'),
    ('<h3>Reduced admin burden</h3>', '<h3>減輕行政負擔</h3>'),
    ('<h3>Stronger clinical efficiency</h3>', '<h3>提升臨床效率</h3>'),
    ('<h2>Proven in real clinical workflows.</h2>', '<h2>已在真實臨床工作流程中驗證。</h2>'),
    ('"It helped us systematically identify patients due for follow up, with an evidence based approach. It easily '
     "unlocked revenue that we didn't even realise we were missing.\"",
     '「它以實證為本的方法，幫助我們有系統地找出需要跟進的病人，輕鬆釋放了我們從未察覺的收入。」'),
    ('<li>Designed with doctors in line with international medical guidelines.</li>',
     '<li>與醫生共同設計，符合國際醫學指引。</li>'),
    ('<li>Trusted by leading medical groups.</li>', '<li>深受領先醫療集團信賴。</li>'),
    ('<li>Built to work with real patient data, lab reports and clinic systems.</li>',
     '<li>可配合真實病人數據、化驗報告及診所系統運作。</li>'),
    ('<h2>Experience how this can be applied to your clinic database.</h2>',
     '<h2>親身體驗如何將此方案應用於您的診所數據庫。</h2>'),
]

WEEKDAYS = {"Sun": "週日", "Mon": "週一", "Tue": "週二", "Wed": "週三", "Thu": "週四", "Fri": "週五", "Sat": "週六"}

T["smart-scheduler"] = [
    ('Patented Technology</span>', '專利技術</span>'),
    ('<h1>Finally a smarter way to generate hospital rosters!</h1>', '<h1>終於有更聰明的方法編排醫院更表！</h1>'),
    ('Smart Scheduler is a scheduling system that automates complex on-call and A&amp;E duty rosters, designed with '
     'a focus on efficiency, fairness, rule-compliance, transparency and customisation.',
     'Smart Scheduler 是一套自動編排複雜候召及急症室值班更表的排班系統，設計上著重效率、公平、合規、透明度及可定制性。'),
    ('<li>Built to work for complicated hospital scheduling constraints and policies.</li>',
     '<li>專為應對複雜的醫院排班限制及政策而設。</li>'),
    ('<li>Trusted by hospital management and staff.</li>', '<li>深受醫院管理層及員工信賴。</li>'),
    ('Book a Smart Scheduler demo', '預約 Smart Scheduler 示範'),
    # Hero roster demo (initial state; script.js animates it from here)
    ('<strong data-scheduler-month>September 2026</strong>', '<strong data-scheduler-month>2026年9月</strong>'),
    ('<span>Generate schedule</span>', '<span>生成更表</span>'),
    ('<span data-scheduler-state>30 days scheduled with all rules satisfied</span>',
     '<span data-scheduler-state>已編排 30 天，符合所有規則</span>'),
    ('<strong>Date</strong>', '<strong>日期</strong>'),
    ('<th>Date</th>', '<th>日期</th>'),
    ('<strong>September schedule generated</strong><small>All leave and 27 rules satisfied</small>',
     '<strong>9月更表已生成</strong><small>已符合所有假期安排及 27 條規則</small>'),
    ('<span><strong>30</strong> days</span><span><strong>42</strong> doctors</span><span><strong>27</strong> rules '
     'satisfied</span>',
     '<span><strong>30</strong> 天</span><span><strong>42</strong> 位醫生</span><span><strong>27</strong> 條規則已符合</span>'),
    ('<p class="section-kicker">Problem & Solution</p>', '<p class="section-kicker">問題與方案</p>'),
    ('<h2>We understand the pain of call list scheduling.</h2>', '<h2>我們明白編排候召表的痛點。</h2>'),
    ('<h3>Endless Hours Wasted</h3>', '<h3>浪費無數時間</h3>'),
    ('Massive admin burden for staff juggling complex spreadsheets, leave requests and message threads.',
     '員工要同時處理複雜的試算表、請假申請及訊息群組，行政負擔沉重。'),
    ('<h3>Perceived Unfairness</h3>', '<h3>感覺不公平</h3>'),
    ('Doctors can feel they always get the undesirable shifts, leading to frustration and burnout.',
     '醫生可能覺得自己總是被編到不理想的更份，導致不滿及身心俱疲。'),
    ('<h3>Convoluted Rules &amp; Policies</h3>', '<h3>錯綜複雜的規則與政策</h3>'),
    ('Rest periods, seniority, weekends, holidays and department policies all need balancing.',
     '休息時間、年資、週末、假日及部門政策都需要兼顧平衡。'),
    ('<h3>Last-Minute Chaos</h3>', '<h3>臨時變動引致混亂</h3>'),
    ("Sick leave or a shift swap can unravel the entire month's schedule.", '一次病假或調更，便可能打亂整個月的更表。'),
    ('<h3>Smart Scheduler turns the mess into a rule-aware roster.</h3>',
     '<h3>Smart Scheduler 將混亂轉化為符合規則的更表。</h3>'),
    ("We build your department's constraints into the engine, then generate on-call or A&amp;E duty schedules that "
     "are faster to produce, easier to explain and fairer to maintain.",
     '我們將您部門的各項限制納入引擎，再生成候召或急症室值班更表：編排更快、更易解釋、更公平。'),
    ('<p class="section-kicker">Use Case</p>', '<p class="section-kicker">應用案例</p>'),
    ('<h2>A leave request becomes a schedule constraint, not another spreadsheet headache.</h2>',
     '<h2>請假申請成為排班條件，而不再是另一個試算表難題。</h2>'),
    ('Start with the everyday operational moment: a doctor adds leave, the request is saved against the month, and '
     'the generator treats it as a hard constraint when building the A&amp;E duty roster.',
     '從日常營運的一刻開始：醫生新增假期後，申請會記錄在該月份，系統編排急症室值班更表時會將其視為硬性條件。'),
    ('<h3>Fairness tracking and transparency</h3>', '<h3>公平度追蹤與透明度</h3>'),
    ('Past duties and visible workloads make the final roster easier to explain.',
     '過往值班記錄及清晰可見的工作量，令最終更表更易解釋。'),
    ('<h3>Effortless efficiency</h3>', '<h3>輕鬆高效</h3>'),
    ('The team moves from manual reshuffling to a generated schedule in a few clicks.',
     '團隊毋須再人手反覆調動，只需點擊幾下即可生成更表。'),
    ('<h3>Customised compliance and flexible rule engine</h3>', '<h3>定制合規設定及靈活規則引擎</h3>'),
    ('Department-specific policies are encoded before the schedule is generated.', '在生成更表前，已預先設定部門專屬政策。'),
    ('<h3>Simple setup</h3>', '<h3>設定簡單</h3>'),
    ('Staff, leave types and constraints stay readable for administrators.', '員工、假期類別及各項限制一目了然，方便管理人員查閱。'),
    ("<h3>CN's Leave Schedule</h3>", '<h3>CN 的假期表</h3>'),
    ('</i> August 2026 <i', '</i> 2026年8月 <i'),
    ('September 2026</div>', '2026年9月</div>'),
    ('<span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>',
     '<span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>'),
    ('</i> Leave added</span>', '</i> 已新增假期</span>'),
    ('Annual Leave <i', '年假 <i'),
    ('Add Leave</span>', '新增假期</span>'),
    ('<h2>How does Smart Scheduler work in practice?</h2>', '<h2>Smart Scheduler 實際如何運作？</h2>'),
    ('<h3>Add Leave</h3>', '<h3>新增假期</h3>'),
    ('<h3>Generate</h3>', '<h3>生成更表</h3>'),
    ('<h3>Share &amp; Track Fairness</h3>', '<h3>分享並追蹤公平度</h3>'),
    ('<h3>Rules Management</h3>', '<h3>規則管理</h3>'),
    ("Manage your team's rules and policies - the engine enforces them automatically.",
     '管理團隊的規則和政策，引擎會自動執行。'),
    ('data-count-unit-one="DAY" data-count-unit-many="DAYS"', 'data-count-unit-one="天" data-count-unit-many="天"'),
    ('data-count-unit-one="DUTY" data-count-unit-many="DUTIES"', 'data-count-unit-one="次" data-count-unit-many="次"'),
    ('<em>2 DAYS</em>', '<em>2 天</em>'),
    ('<em>3 DUTIES</em>', '<em>3 次</em>'),
    ('<em>8 DAYS</em>', '<em>8 天</em>'),
    ('<strong>Duty Spacing</strong>', '<strong>值班間隔</strong>'),
    ('<strong>Senior Night Duty Cap</strong>', '<strong>高級醫生夜更上限</strong>'),
    ('<strong>Off Days per Month</strong>', '<strong>每月休息日數</strong>'),
    ('Junior duty sequence, senior quotas, part-time and locum rules are configured the same way.',
     '初級醫生值班次序、高級醫生配額、兼職及替假醫生規則，均以相同方式設定。'),
    ('<strong>One Call per Holiday Block</strong><small>Christmas / CNY protected</small>',
     '<strong>每個長假期只當值一次</strong><small>聖誕及農曆新年受保障</small>'),
    ('<strong>Senior Doctor Call Days</strong><small>Fri, Sat, Sun + public holidays blocked</small>',
     '<strong>高級醫生當值日</strong><small>週五、六、日及公眾假期不設當值</small>'),
    ('<strong>Pro-Rata Monthly Caps</strong><small>Adjusts caps by working days</small>',
     '<strong>按比例計算每月上限</strong><small>按工作日調整上限</small>'),
    ('<strong>No Day After Night</strong><small>Hard sequence rule</small>',
     '<strong>夜更後不接日更</strong><small>硬性次序規則</small>'),
    ('<strong>No Evening After Night</strong><small>Hard sequence rule</small>',
     '<strong>夜更後不接晚更</strong><small>硬性次序規則</small>'),
    ('<p class="section-kicker">Generated Output</p>', '<p class="section-kicker">生成結果</p>'),
    ('<h2>The finished roster is ready to review, share and explain.</h2>', '<h2>完成的更表可隨時審閱、分享及解釋。</h2>'),
    ('The schedule is not just filled in. Leave is protected, rules are satisfied and the workload evidence is '
     'visible for the whole team.',
     '更表不只是填滿格子：假期得到保障，規則全部符合，整個團隊亦能清楚看到工作量的分佈。'),
    ('<h3>Duty Schedule - August 2026</h3>', '<h3>值班表 - 2026年8月</h3>'),
    ('</i> Generated in 4 s - all rules satisfied</span>', '</i> 4 秒內生成，符合所有規則</span>'),
    ('<span>Clear Schedule</span><span>Edit Schedule</span><span>Re-generate Schedule</span>',
     '<span>清除更表</span><span>編輯更表</span><span>重新生成更表</span>'),
    ('<h3>Metrics - Fairness &amp; Transparency</h3>', '<h3>指標：公平與透明</h3>'),
    ('<p>Days and hours tracked against past assignments.</p>', '<p>按過往編更記錄追蹤日數及時數。</p>'),
    ('</i>Day</span>', '</i>日更</span>'),
    ('</i>Evening</span>', '</i>晚更</span>'),
    ('</i>Night</span>', '</i>夜更</span>'),
    ('</i>Off Days</span>', '</i>休息日</span>'),
    ('<strong>No more doubt over fairness.</strong>', '<strong>不再質疑公平性。</strong>'),
    ('<span>Assignments are visible, comparable and easy to explain.</span>', '<span>編更安排清晰可見、可作比較、易於解釋。</span>'),
    ('<strong>Last-minute changes stay manageable.</strong>', '<strong>臨時變動亦可從容應對。</strong>'),
    ('<span>Leave and swaps are absorbed without rebuilding the month by hand.</span>',
     '<span>毋須人手重新編排整個月，即可處理請假及調更。</span>'),
    ('<strong>Time returns to clinical work or rest.</strong>', '<strong>把時間還給臨床工作或休息。</strong>'),
    ('<span>Administrators review a generated roster instead of wrestling spreadsheets.</span>',
     '<span>管理人員只需審閱已生成的更表，毋須再與試算表搏鬥。</span>'),
    ('<h2>Experience effortless rostering for your department now.</h2>', '<h2>立即為您的部門體驗輕鬆排更。</h2>'),
]

T["radiology-assistant"] = [
    ('<h2 class="product-name">AI Radiology Report Solution</h2>', '<h2 class="product-name">AI 放射科報告方案</h2>'),
    ('<p class="audience-anchor">For radiology teams</p>', '<p class="audience-anchor">適合放射科團隊</p>'),
    ('<h1>Turn voice instructions into structured radiology reports in minutes.</h1>',
     '<h1>數分鐘內將語音指示轉化為結構化放射科報告。</h1>'),
    ('Our AI Radiology Report Solution transcribes recordings, generates structured reports and supports '
     'intelligent data analytics, enhancing workflow efficiency and turnaround time drastically.',
     '我們的 AI 放射科報告方案能轉錄錄音、生成結構化報告並支援智能數據分析，大幅提升工作效率及縮短報告周轉時間。'),
    ('<li>~40%+ reduction in reporting time*</li>', '<li>報告時間減少約 40% 以上*</li>'),
    ('<li>~95%+ transcription accuracy*</li>', '<li>轉錄準確率約 95% 以上*</li>'),
    ('<li>Supports 110 languages.</li>', '<li>支援 110 種語言。</li>'),
    ('Step into the future of clinical reporting', '邁向臨床報告的未來'),
    ('<span>Recording</span>', '<span>錄音中</span>'),
    ('</i> AI Processing</span>', '</i> AI 處理中</span>'),
    ('</i> Radiology Report </div>', '</i> 放射科報告 </div>'),
    ('<span class="rp-label">Patient</span>', '<span class="rp-label">病人</span>'),
    ('<span class="rp-label">Findings</span>', '<span class="rp-label">檢查所見</span>'),
    ('<span class="rp-label">Impression</span>', '<span class="rp-label">診斷印象</span>'),
    ('Structured · Tagged · Ready to sign', '結構化 · 已標記 · 可供簽署'),
    ('<p class="section-kicker">Features</p>', '<p class="section-kicker">功能</p>'),
    ('<h2>Our AI Radiology Report Solution automates radiology report creation from voice recordings.</h2>',
     '<h2>我們的 AI 放射科報告方案可從語音錄音自動生成放射科報告。</h2>'),
    ('Combining accurate transcription with intelligent structuring and data tagging.', '結合準確轉錄、智能結構化及數據標記。'),
    ('<h3>Advanced Audio-to-Text Capabilities</h3>', '<h3>先進的語音轉文字功能</h3>'),
    ('Leveraging advanced Natural Language Processing (NLP) and medical-grade speech recognition techniques, the tool '
     'transforms complex clinical dictations and vocal commands into accurate text, fluently navigating dense '
     'radiological jargon and rapid-fire reporting.',
     '本工具運用先進的自然語言處理（NLP）及醫療級語音識別技術，將複雜的臨床口述及語音指令轉化為準確文字，流暢應對密集的放射科術語及快速的口述報告。'),
    ('<h3>Structured Report Generation</h3>', '<h3>結構化報告生成</h3>'),
    ('Automatically organise findings and commands into applicable reporting structures to meet institutional '
     '&amp; organisational standards.',
     '自動將檢查所見及指令整理成適用的報告結構，符合院方及機構標準。'),
    ('<h3>Contextual Intelligence</h3>', '<h3>情境智能</h3>'),
    ("The tool doesn't just listen; it understands. It recognises specific imaging modalities (e.g. MRI, CT, or "
     "X-ray), and applies contextual understanding to ensure terminology and output are properly incorporated.",
     '本工具不只會聆聽，更能理解。它能識別特定的影像檢查類型（例如 MRI、CT 或 X 光），並運用情境理解，確保術語及輸出內容恰當無誤。'),
    ('<h3>Intelligent Workflow Features</h3>', '<h3>智能工作流程功能</h3>'),
    ('With feedback from radiologists, this tool is designed with smart enhancements to improve the reporting '
     'process, such as Smart Templates, Karaoke-Style Playback, Data Tagging &amp; Analytics.',
     '本工具根據放射科醫生的意見，設計了多項智能功能以改善報告流程，例如智能範本、卡拉 OK 式同步播放、數據標記及分析。'),
    ('<h3>Security &amp; Privacy by Design</h3>', '<h3>從設計開始保障安全與私隱</h3>'),
    ('Our platform features a privacy-first architecture built on enterprise-grade cloud infrastructure to keep any '
     'sensitive information secure and confidential.',
     '我們的平台採用私隱優先的架構，建基於企業級雲端基礎設施，確保所有敏感資料安全保密。'),
    ('<p class="section-kicker">How It Works</p>', '<p class="section-kicker">運作方式</p>'),
    ('<h3>Record or upload audio</h3>', '<h3>錄音或上載音檔</h3>'),
    ('<p>Capture audio directly or upload an existing recording.</p>', '<p>直接錄音或上載現有錄音。</p>'),
    ('<h3>The solution transcribes the dictation</h3>', '<h3>方案轉錄口述內容</h3>'),
    ('<p>Convert spoken reporting into accurate text, automatically.</p>', '<p>自動將口述報告轉換為準確文字。</p>'),
    ('<h3>The solution structures the report</h3>', '<h3>方案整理報告結構</h3>'),
    ('<p>As per your template, where needed.</p>', '<p>如有需要，按您的範本編排。</p>'),
    ('<h3>Review and export</h3>', '<h3>審閱及匯出</h3>'),
    ('<p>Review the report and export in your preferred format.</p>', '<p>審閱報告並以您偏好的格式匯出。</p>'),
    ('<h2>Benefits:</h2>', '<h2>好處：</h2>'),
    ('<span>Faster reporting.</span>', '<span>更快完成報告。</span>'),
    ('<span>Less burnout.</span>', '<span>減少身心耗損。</span>'),
    ('<span>Greater accuracy/consistency.</span>', '<span>更高準確度及一致性。</span>'),
    ('<span>Lower cost.</span>', '<span>更低成本。</span>'),
    ('<span>More data visibility and insights.</span>', '<span>更多數據可見度及洞察。</span>'),
    ('<h2>Designed with practising radiologists.</h2>', '<h2>與執業放射科醫生共同設計。</h2>'),
    ('<p>reduction in reporting time*</p>', '<p>報告時間減少*</p>'),
    ('<p>languages supported.</p>', '<p>種支援語言。</p>'),
    ('<p>transcription accuracy*</p>', '<p>轉錄準確率*</p>'),
    ('<li>Reflects real workflows.</li>', '<li>貼合真實工作流程。</li>'),
    ('<li>Supports clinical terminology.</li>', '<li>支援臨床術語。</li>'),
    ('<li>Built for high-volume environments.</li>', '<li>專為高工作量環境而設。</li>'),
    ('*reported based on user testing, individual results may vary.', '*數據根據用戶測試結果，個別結果或有差異。'),
    ('<h2>Test the AI Radiology Report Solution with your reporting workflow.</h2>',
     '<h2>在您的報告流程中試用 AI 放射科報告方案。</h2>'),
    ("<blockquote>It's more than just a typist; it's a sophisticated partner that speaks the language of "
     "radiology.</blockquote>",
     '<blockquote>它不只是一個打字員，更是一位精通放射科語言的得力夥伴。</blockquote>'),
    ('&mdash; Dr C.Chan (Radiologist)', '&mdash; Dr C.Chan（放射科醫生）'),
]

T["product"] = [
    ('<h1>Your new AI health assistant.</h1>', '<h1>您的全新 AI 健康助理。</h1>'),
    ('AskJune is an AI Health Concierge that handles patient health enquiries/engagement 24/7, intelligently routes '
     'patients to the doctors/providers and services in your clinic network, handles booking and conducts '
     'pre-consultation evaluation and analytics to provide diagnostic and clinical support for doctors.',
     'AskJune 是一位 AI 健康禮賓助理，全天候處理病人的健康查詢及互動，智能地將病人轉介至您診所網絡內合適的醫生／服務提供者及服務，'
     '處理預約，並進行診前評估及分析，為醫生提供診斷及臨床支援。'),
    ('<li>Converts online health queries into bookings.</li>', '<li>將網上健康查詢轉化為預約。</li>'),
    ('<li>Routes patients to suitable services and providers intelligently.</li>', '<li>智能轉介病人至合適的服務及服務提供者。</li>'),
    ('<li>Captures valuable data and generates recommendations and insights.</li>', '<li>收集有價值的數據，並生成建議及洞察。</li>'),
    ('<li>Provides AI-powered clinical and diagnostic support for clinicians.</li>', '<li>為臨床人員提供 AI 驅動的臨床及診斷支援。</li>'),
    ('Explore how AskJune can transform your ecosystem', '探索 AskJune 如何革新您的醫療生態系統'),
    ('Book a demo for your clinic', '為您的診所預約示範'),
    ('<h2>AskJune provides a conversational, always-available front door to your clinic.</h2>',
     '<h2>AskJune 為您的診所提供一個對話式、全天候的服務入口。</h2>'),
    ('Helping patients explain their concerns in their own words, then turning that into structured information, '
     'triage and bookings.',
     '讓病人以自己的話表達健康疑慮，再將其轉化為結構化資料、分流及預約。'),
    ('<h3>Understands free-text patient concerns</h3>', '<h3>理解病人以自由文字表達的疑慮</h3>'),
    ('<li>Feels like a real conversation, not a fixed questionnaire.</li>', '<li>感覺就像真實對話，而非固定問卷。</li>'),
    ('<li>Asks intelligent follow-up questions to build a clinically useful picture.</li>',
     '<li>提出智能追問，建立具臨床參考價值的全面了解。</li>'),
    ('<li>Understands local language and slang, translates free-text dialogue into structured medical data '
     'clinicians can use.</li>',
     '<li>理解本地語言及俚語，將自由對話轉化為臨床人員可使用的結構化醫療數據。</li>'),
    ('<h3>Routes to the most suited doctor/service</h3>', '<h3>轉介至最合適的醫生／服務</h3>'),
    ('<li>Connects patients directly to your booking flow and the right doctors/services.</li>',
     '<li>將病人直接連接至您的預約流程及合適的醫生／服務。</li>'),
    ('<h3>Converts conversations into structured clinical data</h3>', '<h3>將對話轉化為結構化臨床數據</h3>'),
    ('<li>Produces evaluation summaries for consulting doctors, with next steps and red-flag awareness.</li>',
     '<li>為應診醫生製作評估摘要，列明下一步建議並標示警號徵狀。</li>'),
    ('<li>Uses your inputs and proprietary models to suggest likely related health issues and level of urgency, '
     'supporting decision-making and patient education.</li>',
     '<li>根據您的輸入及專有模型，提示可能相關的健康問題及緊急程度，支援決策及病人教育。</li>'),
    ('<h3>Integrates into your existing ecosystem</h3>', '<h3>融入您現有的系統生態</h3>'),
    ('<li>Works with your website, booking system and internal workflows.</li>', '<li>配合您的網站、預約系統及內部工作流程運作。</li>'),
    ('<li>AskJune sits on top of your current setup without disruption.</li>', '<li>AskJune 建基於您現有的系統之上，不會造成任何干擾。</li>'),
    ('<h6>Use Cases and Deployment Options</h6>', '<h6>應用場景及部署選項</h6>'),
    ('<h3>On-site kiosks and tablets</h3>', '<h3>現場自助服務機及平板電腦</h3>'),
    ('<h3>Database</h3>', '<h3>數據庫</h3>'),
    ('<h3>Web App</h3>', '<h3>網頁應用程式</h3>'),
    ('<h3>Mobile App</h3>', '<h3>流動應用程式</h3>'),
    ('<h2>How does <strong>AskJune</strong> work?</h2>', '<h2><strong>AskJune</strong> 如何運作？</h2>'),
    ('<h3>Converse</h3>', '<h3>對話</h3>'),
    ('Engage patients through natural conversation.', '透過自然對話與病人互動。'),
    ('AskJune talks with patients in their own words and language, and responds intelligently — clarifying concerns '
     'as a real conversation, not a fixed form.',
     'AskJune 以病人自己的用語及語言與他們交談，並作出智能回應，像真實對話一樣釐清他們的疑慮，而非填寫固定表格。'),
    ("Hi John — tell me a bit more about how you've been feeling?", '你好 John，可以多講一點你最近的感覺嗎？'),
    ('sometimes I get short of breath', '有時會覺得透唔到氣'),
    ('<h3>Think</h3>', '<h3>思考</h3>'),
    ('Analyse all the relevant factors.', '分析所有相關因素。'),
    ('<li><strong>Patient profile &amp; needs</strong> — age, gender, pregnancy status, symptoms</li>',
     '<li><strong>病人資料及需要</strong>：年齡、性別、懷孕狀況、症狀</li>'),
    ('<li><strong>Clinical relevance</strong> of specialty / packages</li>', '<li>專科／套餐的<strong>臨床相關性</strong></li>'),
    ('<li><strong>Clinic capacity</strong> &amp; internal protocols</li>', '<li><strong>診所容量</strong>及內部指引</li>'),
    ('<li><strong>Location &amp; accessibility</strong></li>', '<li><strong>地點及交通便利程度</strong></li>'),
    ('<h3>Recommend</h3>', '<h3>推薦</h3>'),
    ('Match each patient with the right next step.', '為每位病人配對合適的下一步。'),
    ('Connect patients with the clinic, service and add-ons that best fit their needs.',
     '為病人連接最切合其需要的診所、服務及附加項目。'),
    ('<span>Clinic Match</span>', '<span>診所配對</span>'),
    ('<span>Service / Package</span>', '<span>服務／套餐</span>'),
    ('<span>Add-On Items</span>', '<span>附加項目</span>'),
    ('<h4>Patient Insights</h4>', '<h4>病人洞察</h4>'),
    ('<li>Patient needs and interests</li>', '<li>病人需要及興趣</li>'),
    ('<li>Health concerns raised</li>', '<li>提出的健康疑慮</li>'),
    ('<h4>Service Demand</h4>', '<h4>服務需求</h4>'),
    ('<li>Packages requested</li>', '<li>查詢的套餐</li>'),
    ('<li>Add-on tests considered</li>', '<li>考慮的附加檢查</li>'),
    ('<h4>Operational Intelligence</h4>', '<h4>營運情報</h4>'),
    ('<li>Clinic demand patterns</li>', '<li>診所需求模式</li>'),
    ('<li>Patient behaviour trends</li>', '<li>病人行為趨勢</li>'),
    ('<h3>Data</h3>', '<h3>數據</h3>'),
    ('Learn from every interaction.', '從每次互動中學習。'),
    ('Reveal patient needs, service demand and operational trends that inform better decisions.',
     '揭示病人需要、服務需求及營運趨勢，助您作出更好的決策。'),
    ('<span>More qualified bookings.</span>', '<span>更多合適的預約。</span>'),
    ('<span>Earlier patient engagement.</span>', '<span>更早與病人互動。</span>'),
    ('<span>Better patient trust.</span>', '<span>提升病人信任。</span>'),
    ('<span>Reduced admin and front-desk burden.</span>', '<span>減輕行政及前台負擔。</span>'),
    ('<span>Stronger clinical efficiency.</span>', '<span>提升臨床效率。</span>'),
    ('<h2>Learn how AskJune can enhance your customer journey and clinic workflow</h2>',
     '<h2>了解 AskJune 如何提升您的客戶體驗及診所工作流程</h2>'),
    ('<h2>Meet patients where they already are.</h2>', '<h2>在病人所在之處與他們接觸。</h2>'),
    ('Patients are already searching for answers online. AskJune gives clinics a safe, clinically-aligned way to meet '
     'them there, guide them with reliable information and connect them to appropriate care in your own ecosystem.',
     '病人早已在網上尋找答案。AskJune 為診所提供一個安全、符合臨床標準的方式，在網上與病人接觸，以可靠資訊引導他們，'
     '並將他們連接至您醫療網絡內的合適護理服務。'),
]


def flexible(pattern):
    """Regex for a literal string where any run of whitespace may be any other run (HTML line wrapping)."""
    return re.compile(r"\s+".join(re.escape(part) for part in pattern.split()))


def translate(body, pairs, page):
    for english, chinese in pairs:
        body, count = flexible(english).subn(lambda _: chinese, body)
        if count == 0:
            sys.exit(f"[{page}] no match for: {english[:90]!r}")
    return body


def localise_paths(html, slug):
    # Assets and styles: root-absolute so /zh and /zh/ both resolve correctly.
    html = re.sub(r'((?:href|src)=")(styles|assets|design-reference)/', r"\1/\2/", html)
    html = re.sub(r"(url\(['\"]?)(assets|design-reference)/", r"\1/\2/", html)
    # Internal page links point at the Chinese copies.
    names = "|".join(re.escape(p) for p in PAGE_LINKS)
    html = re.sub(rf'href="({names})(#[^"]*)?"', r'href="/zh/\1\2"', html)
    html = html.replace('<a href="/"><img', '<a href="/zh/"><img')
    # Language switch flips to English.
    html = html.replace(
        f'<a class="lang-switch" href="/zh/{slug}" hreflang="zh-HK" lang="zh-HK">中文</a>',
        f'<a class="lang-switch" href="/{slug}" hreflang="en" lang="en">EN</a>',
    )
    return html


def build_page(page):
    source = (ROOT / f"{page}.html").read_bytes().decode("utf-8")
    slug = "" if page == "index" else page
    head, sep, body = source.partition("<body>")
    if not sep:
        sys.exit(f"[{page}] no <body> tag")

    head = head.replace('<html lang="en">', '<html lang="zh-HK">', 1)
    if "charset" not in head.lower():
        head = re.sub(r"<head>(\r?\n)", lambda m: f'<head>{m.group(1)}  <meta charset="utf-8">{m.group(1)}', head, count=1)
    head = head.replace("&display=swap", "&family=Noto+Sans+HK:wght@400;500;600;700&display=swap", 1)

    body = translate(body, T.get(page, []), page)
    if page == "smart-scheduler":
        body = re.sub(r"<(strong|th)>(\d+) (Sun|Mon|Tue|Wed|Thu|Fri|Sat)</",
                      lambda m: f"<{m.group(1)}>{m.group(2)} {WEEKDAYS[m.group(3)]}</", body)
    body = translate(body, COMMON_FOR[page], page)

    html = localise_paths(head + sep + body, slug)
    if 'hreflang="en" lang="en">EN</a>' not in html:
        sys.exit(f"[{page}] language switch not found")
    return html


def build_redirect_stub():
    source = (ROOT / "ai-typist.html").read_bytes().decode("utf-8")
    html = source.replace('<html lang="en">', '<html lang="zh-HK">', 1)
    html = html.replace('href="https://rapportaimedical.com/radiology-assistant"',
                        'href="https://rapportaimedical.com/zh/radiology-assistant"')
    html = html.replace('url=radiology-assistant', 'url=/zh/radiology-assistant')
    html = html.replace('replace("radiology-assistant")', 'replace("/zh/radiology-assistant")')
    html = html.replace('<a href="radiology-assistant">', '<a href="/zh/radiology-assistant">')
    html = translate(html, [
        ('This page has moved. If you are not redirected automatically,', '此頁面已遷移。如未能自動轉往新頁面，'),
        ('click here to continue to the AI Radiology Report Solution</a>.', '請按此前往 AI 放射科報告方案</a>。'),
    ], "ai-typist")
    return html


# Only apply the COMMON entries a page actually contains (e.g. not every page has the ReAcq widget),
# but still require the nav entries everywhere.
NAV_ENTRY_COUNT = 10


def common_for(page):
    source = (ROOT / f"{page}.html").read_bytes().decode("utf-8").partition("<body>")[2]
    source = translate(source, T.get(page, []), page)
    return COMMON[:NAV_ENTRY_COUNT] + [
        (en, zh) for en, zh in COMMON[NAV_ENTRY_COUNT:] if flexible(en).search(source)
    ]


COMMON_FOR = {page: common_for(page) for page in PAGES}


def main():
    OUT.mkdir(exist_ok=True)
    for page in PAGES:
        (OUT / f"{page}.html").write_bytes(build_page(page).encode("utf-8"))
        print(f"zh/{page}.html")
    (OUT / "ai-typist.html").write_bytes(build_redirect_stub().encode("utf-8"))
    print("zh/ai-typist.html")


if __name__ == "__main__":
    main()
