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
