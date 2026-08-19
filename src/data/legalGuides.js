export const LEGAL_GUIDES = [
  {
    id: 'arrest-rights',
    cat: 'Criminal Law',
    color: '#f55d25',
    title: 'Your Rights When Arrested Under Ethiopian Law',
    subtitle: 'A step-by-step guide to constitutional protections, police detention limits, and bail rights in Ethiopia.',
    read: '6 min read',
    updated: 'Updated February 2026',
    author: 'Advocate Kebede Haile Mariam · Reviewed by FDRE Legal Counsel',
    proclamations: [
      'FDRE Constitution (1995), Articles 17–21',
      'Criminal Procedure Code of Ethiopia (1961)',
      'Criminal Code of Ethiopia, Proclamation No. 414/2004'
    ],
    summary: 'Being arrested or questioned by law enforcement in Ethiopia is governed by strict constitutional standards. Knowing your 48-hour court appearance right, the right to remain silent, and how bail is determined can protect you from unlawful detention.',
    sections: [
      {
        heading: '1. The Right to Know the Reason for Arrest',
        content: 'Under Article 19(1) of the FDRE Constitution, anyone arrested has the immediate right to be informed, in a language they understand, of the reasons for their arrest and the specific offenses they are suspected of committing. Police officers must identify themselves and specify the legal ground for detention.'
      },
      {
        heading: '2. The 48-Hour Rule (Habeas Corpus & Court Appearance)',
        content: 'Article 19(3) mandates that every arrested person must be brought before a court of law within 48 hours of their arrest (excluding reasonable travel time). If police fail to produce the suspect before a judge within this window without lawful judicial extension (ቀጠሮ), the continued detention becomes unlawful.',
        alert: {
          type: 'important',
          text: 'Police cannot arbitrarily extend detention without a formal remand order (የጊዜ ቀጠሮ) granted by a sitting judge in open court.'
        }
      },
      {
        heading: '3. The Right to Remain Silent and Access Counsel',
        content: 'Under Article 19(2) and Article 20, suspects cannot be compelled to make confessions or admissions that could be used against them. Any statement obtained through coercion, physical abuse, or psychological duress is inadmissible in court. Suspects have the right to consult a licensed advocate before answering substantive interrogation questions.'
      },
      {
        heading: '4. Bail Rights and Conditions (የዋስትና መብት)',
        content: 'In Ethiopian criminal jurisprudence, bail is the constitutional rule and detention is the exception (Article 19(6)). Unless the offense carries severe capital penalties or there is documented flight risk or witness tampering, courts will set financial or surety bail.'
      }
    ],
    keyTakeaways: [
      'Demand to be presented before a court within 48 hours.',
      'You are entitled to consult an advocate before signing interrogation statements.',
      'Torture or coerced confessions are strictly void and illegal under Art. 18 & 19.',
      'Bail should always be requested at the first court appearance.'
    ],
    faqs: [
      {
        q: 'Can police search my house without a warrant in Ethiopia?',
        a: 'Generally no. Under the Criminal Procedure Code, a judicial search warrant (የፍተሻ ትእዛዝ) is mandatory except in narrow hot pursuit or emergency situations.'
      },
      {
        q: 'What if I cannot afford a lawyer for a serious felony charge?',
        a: 'Under Article 20(5) of the Constitution, state-sponsored public defense counsel must be provided if the offense carries severe prison sentences and the suspect lacks financial means.'
      }
    ]
  },
  {
    id: 'divorce-procedures',
    cat: 'Family Law',
    color: '#008cc9',
    title: 'Understanding Divorce Procedures in Ethiopia',
    subtitle: 'Grounds, reconciliation requirements, child custody, and community property division under the Revised Family Code.',
    read: '8 min read',
    updated: 'Updated January 2026',
    author: 'Advocate Tigist Alemu Bekele · Family & Estate Specialist',
    proclamations: [
      'Federal Revised Family Code, Proclamation No. 213/2000',
      'Civil Procedure Code of Ethiopia (1965)'
    ],
    summary: 'Ethiopian family law recognizes marriage as an equal partnership. Whether divorce is sought by mutual consent or unilateral petition, the law establishes mandatory reconciliation periods, child best-interest standards, and equal division of common property.',
    sections: [
      {
        heading: '1. Grounds for Divorce in Ethiopia',
        content: 'Under the Federal Revised Family Code (Proclamation No. 213/2000), marriage can be dissolved either by mutual consent of both spouses or by petition of one spouse. Unlike old statutes, a spouse is not strictly required to prove fault (such as adultery or cruelty) to obtain a divorce if mutual life has become untenable.'
      },
      {
        heading: '2. Mandatory Family Arbitrators (የቤተሰብ ሽማግሌዎች)',
        content: 'Before granting a final divorce decree, Ethiopian courts refer the dispute to Family Arbitrators or judicial conciliation officers. The arbitrators have up to 3 months (extendable to 6 months) to attempt reconciliation. If reconciliation fails, they submit a report to the court to proceed with dissolution.'
      },
      {
        heading: '3. Division of Common Property (የጋራ ንብረት)',
        content: 'All assets and income acquired during marriage are legally presumed to be common property (የጋራ ንብረት) and split equally (50/50), unless an asset is proven to be personal property (የግል ንብረት) acquired prior to marriage, via gift, or through inheritance explicitly designated to one spouse.'
      },
      {
        heading: '4. Child Custody and Maintenance (የልጆች ቀለብና አስተዳደግ)',
        content: 'Custody decisions are strictly guided by the "Best Interests of the Child" standard (Article 113). Courts consider the age of the child, emotional bonds, schooling stability, and moral fitness of each parent. The non-custodial parent is ordered to pay proportional monthly maintenance allowance based on verified income.'
      }
    ],
    keyTakeaways: [
      'Mutual consent divorces proceed significantly faster through simplified agreements.',
      'Arbitration is mandatory by law before the court enters a final dissolution decree.',
      'Personal property before marriage remains personal if documentation or clear proof is preserved.',
      'Child support orders are enforceable through salary garnishment and bank attachments.'
    ],
    faqs: [
      {
        q: 'How long does a divorce take in Ethiopian Federal First Instance Courts?',
        a: 'A mutual consent divorce can take 1 to 3 months, whereas a contested divorce involving property valuation and dispute resolution may take 6 to 12 months.'
      },
      {
        q: 'Can customary or religious marriages be divorced in civil court?',
        a: 'Yes. Proclamation 213/2000 gives civil courts full jurisdiction over the dissolution and civil effects of customary, religious, and civil marriages.'
      }
    ]
  },
{
    id: 'register-business',
    cat: 'Corporate Law',
    color: '#52a304',
    title: 'How to Register a Business in Ethiopia (2026 Commercial Guide)',
    subtitle: 'Navigating business forms, the new Commercial Code Proc. 1243/2021, and Ministry of Trade electronic licensing.',
    read: '7 min read',
    updated: 'Updated March 2026',
    author: 'Advocate Dawit Tadesse Mengistu · Commercial & Tax Practice',
    proclamations: [
      'Commercial Code of Ethiopia, Proclamation No. 1243/2021',
      'Commercial Registration and Licensing Proclamation No. 980/2016 (as amended)',
      'Investment Proclamation No. 1180/2020'
    ],
    summary: 'The modern Commercial Code of 2021 transformed corporate registration in Ethiopia. From One-Person Companies (OPCs) to Share Companies (SCs) and Private Limited Companies (PLCs), learn the legal requirements and step-by-step registration flow.',
    sections: [
      {
        heading: '1. Choosing the Right Business Structure',
        content: 'Under Proclamation No. 1243/2021, entrepreneurs can form Sole Proprietorships, One-Person Companies (OPC), Private Limited Companies (PLC - 2 to 50 members), Share Companies (minimum 5 founders), or General Partnerships. The OPC structure now allows single entrepreneurs to enjoy limited liability without fictitious nominee shareholders.'
      },
      {
        heading: '2. Minimum Capital Requirements',
        content: 'The new Commercial Code eliminated the rigid 15,000 ETB fixed statutory minimum capital for standard PLCs, allowing founders to set commercial capital appropriate for their declared activities. Share Companies require a minimum statutory capital of 100,000 ETB, with at least 25% paid-up upon establishment.'
      },
      {
        heading: '3. Memorandum & Articles of Association (መመስረቻ ጽሁፍ እና መተዳደሪያ ደንብ)',
        content: 'Founding documents must specify the business purpose, registered office address, governance structure, manager authorities, and dispute resolution clauses. Documents are authenticated through the Documents Authentication and Registration Agency (DARA) or authorized regional notary.'
      },
      {
        heading: '4. e-Trade Registration & Tax Identification (TIN)',
        content: 'Registration is executed through the Ministry of Trade and Regional Integration (e-Trade) portal. Once approved, the company receives its Commercial Registration Certificate, Tax Identification Number (TIN), and Business License.'
      }
    ],
    keyTakeaways: [
      'One-Person Companies (OPC) are now fully recognized under the 2021 Commercial Code.',
      'Memorandum of Association must clearly delimit the powers of general managers.',
      'Foreign investors must comply with the capital thresholds stipulated in Investment Proclamation 1180/2020.',
      'Annual renewals and tax clearance certificates (ግብር ክሊራንስ) are mandatory to preserve active status.'
    ],
    faqs: [
      {
        q: 'Can foreign nationals invest in retail or trade in Ethiopia?',
        a: 'Recent regulatory directives opened several wholesale and retail sectors to foreign capital, subject to capital minimums and Ethiopian Investment Commission (EIC) permits.'
      },
      {
        q: 'What is the personal liability of shareholders in an Ethiopian PLC?',
        a: 'Shareholders are liable only up to the unpaid amount of their subscribed shares, shielding personal private wealth from corporate debts.'
      }
    ]
  },
  {
    id: 'land-rights-title',
    cat: 'Civil & Land Law',
    color: '#8b5cf6',
    title: 'Land Rights, Leases, and Title Deeds in Ethiopia',
    subtitle: 'Understanding urban land leaseholdings, rural usufructuary rights, and avoiding real estate transaction fraud.',
    read: '9 min read',
    updated: 'Updated February 2026',
    author: 'Advocate Solomon Assefa Worku · Property & Land Litigator',
    proclamations: [
      'FDRE Constitution, Article 40(3) (State Ownership of Land)',
      'Urban Land Leaseholding Proclamation No. 721/2011',
      'Expropriation and Compensation Proclamation No. 1161/2019'
    ],
    summary: 'In Ethiopia, land is the collective property of the state and the nations, nationalities, and peoples. Private individuals hold leasehold rights in urban areas and possessory rights in rural areas. Learn how to verify title deeds, transfer property legally, and protect your real estate investments.',
    sections: [
      {
        heading: '1. The Constitutional Foundation of Land in Ethiopia',
        content: 'Article 40(3) of the FDRE Constitution establishes that the right to ownership of rural and urban land is exclusively vested in the State and in the peoples of Ethiopia. Land is a common property that cannot be subject to private freehold sale or barter; however, buildings, plants, and improvements on the land are full private property.'
      },
      {
        heading: '2. Urban Land Leaseholding (የከተማ ቦታ በሊዝ ስለመያዝ)',
        content: 'Under Proclamation No. 721/2011, urban land tenure is exclusively acquired through lease auction, allotment for public projects, or historical old possession permits (ነባር ይዞታ). Leases are granted for specific durations (up to 99 years for residential, 70–80 years for commercial).'
      },
      {
        heading: '3. Buying and Selling Real Estate (የቤት ሽያጭ ውል)',
        content: 'A contract for the sale of immovable property (houses, commercial buildings) is legally VOID unless made in writing and registered with the authorized municipal land registry and DARA. Hand-written sales agreements (የእጅ ውል) outside the cadastral registry create severe eviction and fraud risks.'
      },
      {
        heading: '4. Expropriation & Compensation Standards',
        content: 'When land is expropriated for public interest, Proclamation 1161/2019 guarantees compensation for property situated on the land, permanent improvements, displacement allowances, and substitute residential land plots.'
      }
    ],
    keyTakeaways: [
      'Always inspect the Master Cadastral Register (የካዳስተር መዝገብ) before paying property advances.',
      'Unregistered real estate sales contracts hold no legal standing against third-party claimants.',
      'Check for active court injunctions (የእግድ ትእዛዝ) or bank mortgages on the title deed certificate (ካርታ).'
    ],
    faqs: [
      {
        q: 'Can a bank foreclose on a leased property in Ethiopia?',
        a: 'Yes. If a debtor defaults on a loan secured by a registered mortgage over the building and lease rights, the bank may auction the property under Proclamation 97/98.'
      }
    ]
  },
  {
    id: 'labour-rights',
    cat: 'Labour Law',
    color: '#ed4f4b',
    title: 'Employee Rights Under Labour Proclamation No. 1156/2019',
    subtitle: 'Severance pay, unlawful termination, working hours, leave entitlements, and labour court dispute resolution.',
    read: '6 min read',
    updated: 'Updated January 2026',
    author: 'Advocate Rahel Girmay Gebru · Employment & Trade Dispute Specialist',
    proclamations: [
      'Labour Proclamation No. 1156/2019',
      'Federal Civil Servants Proclamation No. 1064/2017'
    ],
    summary: 'Labour Proclamation No. 1156/2019 governs private employment relationships across Ethiopia. It provides protections against unlawful dismissals, defines probation limits, guarantees paid leaves, and outlines statutory compensation for work-related injuries.',
    sections: [
      {
        heading: '1. Employment Contracts and Probation Limits',
        content: 'Employment contracts can be made for definite or indefinite periods. Under Article 11, the maximum statutory probation period is 60 working days. If an employee continues working after 60 days without written notice of failure, they automatically become a permanent employee.'
      },
      {
        heading: '2. Unlawful Termination and Compensation (ያለአግባብ ስንብት)',
        content: 'An employer cannot terminate an employment contract without lawful objective grounds (such as grave misconduct under Art. 27 or redundancy under Art. 28). If a court finds the termination unlawful, the employer must either reinstate the employee with back-pay or pay statutory compensation plus severance allowance.'
      },
      {
        heading: '3. Working Hours, Overtime, and Paid Leaves',
        content: 'Normal maximum working hours are 8 hours per day or 48 hours per week. Annual leave starts at a minimum of 16 working days for the first year of service and increases by 1 day for every additional 2 years. Female employees are entitled to 120 days of fully paid maternity leave (30 days pre-natal, 90 days post-natal).'
      },
      {
        heading: '4. Labour Dispute Settlement Flow',
        content: 'Employment disputes are first submitted to Labour Conciliation officers. If unconciliated within 30 days, the claimant can file suit in the Labour Relations Board or Federal/Regional First Instance Labour Division.'
      }
    ],
    keyTakeaways: [
      'Probation cannot exceed 60 working days by law.',
      'Maternity leave is 120 consecutive days with full wage payment.',
      'Termination without written notice and lawful grounds triggers mandatory severance and damage pay.',
      'Claims for unlawful termination must be filed within statutory limitation periods (3 months).'
    ],
    faqs: [
      {
        q: 'Can an employer withhold salary during a dispute?',
        a: 'No. Wage deductions are illegal unless authorized by law, court order, or written consent of the employee.'
      }
    ]
  },
  {
    id: 'constitutional-rights',
    cat: 'Constitutional Law',
    color: '#fc9835',
    title: 'Fundamental Rights Under the FDRE Constitution',
    subtitle: 'Understanding Chapter Three human rights, democratic freedoms, judicial review, and the right to due process.',
    read: '10 min read',
    updated: 'Updated February 2026',
    author: 'Advocate Yared Kassahun Wolde · Constitutional & Appellate Law',
    proclamations: [
      'Constitution of the Federal Democratic Republic of Ethiopia (1995)',
      'Council of Constitutional Inquiry Proclamation No. 798/2013'
    ],
    summary: 'Chapter Three of the 1995 Constitution contains Ethiopia’s comprehensive Bill of Rights, divided into Human Rights (Arts. 14–28) and Democratic Rights (Arts. 29–44). Learn how these constitutional guarantees protect citizens in daily life and legal disputes.',
    sections: [
      {
        heading: '1. The Primacy of the Constitution (Article 9)',
        content: 'The Constitution is the supreme law of the land. Any law, customary practice, or decision of an organ of state or public official that contravenes the Constitution is of no legal effect. International human rights treaties ratified by Ethiopia are integral parts of the domestic legal system.'
      },
      {
        heading: '2. Right to Life, Liberty, and Person (Articles 14–18)',
        content: 'Every person has the inviolable right to life, physical integrity, and liberty. Cruel, inhuman, or degrading treatment or punishment is strictly prohibited without exception.'
      },
      {
        heading: '3. Freedom of Expression, Assembly, and Association (Articles 29–31)',
        content: 'Citizens possess the right to hold opinions without interference, seek and impart information, assemble peacefully without prior authorization, and form trade unions or civil society organizations.'
      },
      {
        heading: '4. Constitutional Interpretation & Council of Constitutional Inquiry',
        content: 'When constitutional disputes arise in any court, legal questions involving interpretation are referred to the Council of Constitutional Inquiry (CCI) and finalized by the House of Federation (HoF).'
      }
    ],
    keyTakeaways: [
      'Constitutional rights apply to all persons within Ethiopian sovereign territory.',
      'Human rights provisions are interpreted in conformity with the Universal Declaration of Human Rights.',
      'Courts must protect fair trial rights, access to justice, and due process under Article 37.'
    ],
    faqs: [
      {
        q: 'Can ordinary courts declare a federal proclamation unconstitutional in Ethiopia?',
        a: 'No. The power of constitutional interpretation is exclusively vested in the House of Federation with advice from the Council of Constitutional Inquiry.'
      }
    ]
  },
  {
    id: 'ip-trademark',
    cat: 'Intellectual Property',
    color: '#0284c7',
    title: 'Protecting Trademarks and Copyrights in Ethiopia',
    subtitle: 'Registering brands, preventing counterfeit piracy, and patent enforcement through the Ethiopian Intellectual Property Authority (EIPA).',
    read: '5 min read',
    updated: 'Updated March 2026',
    author: 'Advocate Dawit Tadesse Mengistu · IP & Commercial Specialist',
    proclamations: [
      'Trademark Registration and Protection Proclamation No. 501/2006',
      'Copyright and Neighboring Rights Protection Proclamation No. 410/2004 (as amended)'
    ],
    summary: 'Securing your trademark or creative copyright in Ethiopia prevents brand imitation and commercial counterfeiting. Learn the registration lifecycle at EIPA, opposition procedures, and civil injunction enforcement.',
    sections: [
      {
        heading: '1. Trademark Registration Flow at EIPA',
        content: 'Trademark applications are filed with the Ethiopian Intellectual Property Authority (EIPA) classified under the Nice Agreement. Following formal examination, the mark is published in the Official Gazette for a 90-day opposition window before registration issuance.'
      },
      {
        heading: '2. Duration and Renewals',
        content: 'A registered trademark in Ethiopia is protected for 7 years from filing date and can be renewed indefinitely for consecutive 7-year periods upon payment of statutory renewal fees.'
      },
      {
        heading: '3. Legal Remedies for Infringement',
        content: 'Rights holders can obtain ex-parte preliminary injunctions (የእግድ ትእዛዝ), customs border seizures of counterfeit imports, and damages for lost profits in the Federal High Court Commercial Bench.'
      }
    ],
    keyTakeaways: [
      'Ethiopia operates on a "first-to-file" trademark principle.',
      'Registering a trade name with the Ministry of Trade does NOT automatically confer trademark protection.',
      'Copyright protection arises automatically upon creation, but formal registration provides prima facie proof.'
    ],
    faqs: [
      {
        q: 'Is an international Madrid Protocol trademark recognized directly in Ethiopia?',
        a: 'Ethiopia is not a member of the Madrid System; foreign trademarks must be registered directly through a licensed local advocate or IP agent in Addis Ababa.'
      }
    ]
  },
  {
    id: 'wills-inheritance',
    cat: 'Civil Law',
    color: '#059669',
    title: 'Wills, Inheritance, and Succession in Ethiopian Civil Law',
    subtitle: 'Drafting valid wills, holographic wills, legal heirs order, and estate liquidation under the 1960 Civil Code.',
    read: '7 min read',
    updated: 'Updated February 2026',
    author: 'Advocate Tigist Alemu Bekele · Estate & Succession Practice',
    proclamations: [
      'Civil Code of Ethiopia (1960), Articles 826–1125',
      'Federal Courts Proclamation'
    ],
    summary: 'Distributing estates under Ethiopian law is governed by the provisions of testate (will-based) or intestate (statutory) succession. Learn the formalities for making a valid will, rights of surviving spouses, and estate administrator appointment.',
    sections: [
      {
        heading: '1. Types of Valid Wills in Ethiopia',
        content: 'The Civil Code recognizes three forms of wills: Public Wills (drafted and signed before a notary/registrar and witnesses), Holographic Wills (entirely handwritten, dated, and signed by the testator), and Oral Wills (restricted to imminent death emergencies).'
      },
      {
        heading: '2. Order of Legal Heirs (Intestate Succession)',
        content: 'When someone passes away without a valid will, the estate descends according to statutory orders: 1st Degree (children and descendants), 2nd Degree (parents), 3rd Degree (brothers and sisters), and 4th Degree (grandparents and collateral relatives).'
      },
      {
        heading: '3. Liquidation of Estate Debts',
        content: 'Before heirs can distribute inheritances, estate debts, court costs, and funeral expenses must be cleared through an officially appointed Estate Liquidator (የውርስ አጣሪ).'
      }
    ],
    keyTakeaways: [
      'Holographic wills must be 100% in the testator’s own handwriting with a clear date.',
      'A surviving spouse retains their 50% share of marital common property before estate distribution.',
      'Disinheritance (ውርስ መከልከል) requires specific lawful justifications specified in the Civil Code.'
    ],
    faqs: [
      {
        q: 'Can property held outside Ethiopia be included in an Ethiopian will?',
        a: 'Yes, provided the will complies with international private law conflict rules and local immovable property transfer statutes.'
      }
    ]
  }
];
