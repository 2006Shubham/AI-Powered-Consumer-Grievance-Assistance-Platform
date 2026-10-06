from typing import List, Dict, Any

LEGAL_KNOWLEDGE_BASE: List[Dict[str, Any]] = [
    # --- STATUTORY ACTS & RULES ---
    {
        "id": "cpa_2019_sec_2_34",
        "title": "Consumer Protection Act 2019 - Product Liability (Sections 2(34), 82-87)",
        "category": "electronics",
        "source": "Consumer Protection Act 2019, Section 2(34) & Sections 82-87",
        "content": "Section 2(34) of CPA 2019 defines Product Liability as the responsibility of a product manufacturer or seller to compensate for any harm caused by a defective product or service. Under Section 84, a manufacturer is liable if: (a) the product contains a manufacturing defect; (b) is defective in design; (c) there is a deviation from manufacturing specifications; (d) the product does not conform to the express warranty. Under Section 86, the product seller is liable if they exercised substantial control over designing or testing, altered the product, or failed to conform to express warranty. The consumer is legally entitled to unit replacement, 100% full refund, or monetary compensation."
    },
    {
        "id": "cpa_2019_sec_2_47",
        "title": "Consumer Protection Act 2019 - Unfair Trade Practice (Section 2(47))",
        "category": "ecommerce",
        "source": "Consumer Protection Act 2019, Section 2(47)",
        "content": "Section 2(47) defines Unfair Trade Practices including making false or misleading representations regarding product standard, quality, grade, or style; refusing to issue a bill or cash memo; and refusing to take back defective goods or refund the amount paid within the period stipulated in the bill or within 30 days. Misleading consumers about replacement policies or withholding refunds when goods fail constitutes a actionable statutory violation."
    },
    {
        "id": "cpa_2019_sec_2_11",
        "title": "Consumer Protection Act 2019 - Deficiency in Service (Section 2(11))",
        "category": "general_service",
        "source": "Consumer Protection Act 2019, Section 2(11)",
        "content": "Deficiency means any fault, imperfection, shortcoming or inadequacy in the quality, nature and manner of performance which is required to be maintained by law or contract. Unreasonable delays in warranty service (>30 days), failure of authorized service centers to repair defective products, or disclaiming liability without technical evidence constitutes Deficiency in Service, entitling the consumer to compensation."
    },
    {
        "id": "e_commerce_rules_2020_refunds",
        "title": "Consumer Protection (E-Commerce) Rules 2020 - Return & Refund Rights (Rules 5, 6 & 7)",
        "category": "ecommerce",
        "source": "Consumer Protection (E-Commerce) Rules 2020, Rule 5(1), Rule 6 & Rule 7",
        "content": "Under Consumer Protection (E-Commerce) Rules 2020, marketplace platforms like Amazon India and Flipkart are strictly prohibited from imposing cancellation charges unless borne by them upon unilateral cancellation. Every platform must acknowledge consumer grievances within 48 hours and resolve them within 30 days via a designated Nodal Grievance Officer. E-commerce platforms cannot disown liability for defective or spurious goods delivered by third-party sellers on their marketplace."
    },
    {
        "id": "dcdrc_edaakhil_jurisdiction",
        "title": "District Consumer Commission & e-Daakhil Redressal Mechanism (Section 35)",
        "category": "general_service",
        "source": "Consumer Protection Act 2019, Section 34 & 35; e-Daakhil Portal",
        "content": "Consumers can file formal complaints online through the National Consumer Helpline (consumerhelpline.gov.in / 1915) or directly submit an electronic case via the e-Daakhil portal to the District Consumer Disputes Redressal Commission (DCDRC). District Commissions have pecuniary jurisdiction up to ₹50 Lakhs. Pre-litigation formal demand notices with a 15-day compliance deadline are standard practice before judicial filing."
    },

    # --- BRAND POLICIES: HP INDIA ---
    {
        "id": "hp_india_warranty_doa_policy",
        "title": "HP India - Laptop & Hardware Warranty and 14-Day DOA Policy",
        "category": "electronics",
        "source": "HP India Limited Hardware Warranty Statement & DOA Guidelines (CPA 2019 Section 84)",
        "content": "HP India provides a 1-Year Limited Hardware Warranty covering manufacturing defects across Pavilion, Victus, Omen, Envy, and 14s/15s series. Under HP DOA (Dead on Arrival) policy, if a laptop exhibits hardware failure within 14 calendar days from the invoice date, the consumer is entitled to a DOA Verification Certificate from an HP Authorized Service Center (ASC) for complete unit replacement or full refund from the seller (Flipkart/Amazon/Retailer). False classification of motherboard failures as Customer Induced Damage (CID) without microscopic liquid ingress evidence violates Section 84 of CPA 2019. If HP ASC fails to supply replacement parts within 30 days, the customer has a statutory right to replacement with a new unit or refund."
    },

    # --- BRAND POLICIES: ACER INDIA ---
    {
        "id": "acer_india_warranty_repair_policy",
        "title": "Acer India - Warranty, Chassis/Hinge Structural Defect & DOA Norms",
        "category": "electronics",
        "source": "Acer India Domestic Warranty Terms & Service Level Agreement (SLA)",
        "content": "Acer India provides a 1-Year Domestic Warranty with on-site service for gaming lines (Nitro, Predator) and carry-in service for Aspire series. DOA window is 7 to 14 days from delivery. Acer call center (1800-11-6677) must log calls and dispatch technicians within 48-72 hours. Common issues: laptop hinge cracking and chassis seam separation due to torsional stress are inherent mechanical design flaws under CPA 2019 Section 84(1)(b) and cannot be arbitrarily dismissed as 'physical damage'. If parts are unavailable beyond 30 days, Acer is obligated to replace the unit or approve full dealer refund."
    },

    # --- BRAND POLICIES: SAMSUNG INDIA ---
    {
        "id": "samsung_india_screen_appliance_policy",
        "title": "Samsung India - Warranty, AMOLED Screen Line Issue & Appliance Redressal",
        "category": "electronics",
        "source": "Samsung India Warranty Card & Consumer Redressal Norms",
        "content": "Samsung India provides a 1-Year Comprehensive Warranty on smartphones, tablets, and smart TVs, with 10-20 years warranty on Digital Inverter compressors/motors. DOA claim window is 14 days from invoice. Critical precedent: 'Green/Pink Line' display artifacts appearing spontaneously on AMOLED screens after official Samsung One UI software updates are recognized as latent manufacturer defects under CPA 2019 Section 84. Samsung ASCs cannot charge consumers ₹12,000–₹16,000 for display panels damaged by manufacturer updates. Moisture indicator (LDI) tripping due to Indian ambient humidity cannot void IP68 water-resistance claims without demonstrated liquid submersion."
    },

    # --- BRAND POLICIES: APPLE INDIA ---
    {
        "id": "apple_india_limited_warranty_aasp",
        "title": "Apple India - 1-Year Limited Warranty, AASP Inspection & DOA Norms",
        "category": "electronics",
        "source": "Apple India One (1) Year Limited Warranty & Statutory Consumer Law Rights",
        "content": "Apple India provides a 1-Year Limited Warranty covering defects in materials and workmanship for iPhone, Mac, iPad, and Apple Watch when used in accordance with user manuals. For purchases from Apple Store Online India, a 14-day direct return window applies. For purchases from Flipkart, Amazon.in, Croma, or Imagine, Apple Authorised Service Providers (AASPs) must issue diagnostic reports. If a newly unboxed device suffers rapid battery discharge (>20%/hr idle), thermal overheating (>43°C), or logic board failure within 14 days, the consumer is entitled to DOA replacement under CPA 2019. AASPs cannot deny statutory remedies by citing internal diagnostic benchmarks if ordinary usability is impaired."
    },

    # --- BRAND POLICIES: FLIPKART INDIA ---
    {
        "id": "flipkart_open_box_and_replacement",
        "title": "Flipkart India - 7-Day Replacement Policy & Open Box Delivery (OBD) Norms",
        "category": "ecommerce",
        "source": "Flipkart Internet Pvt Ltd Return Policy & E-Commerce Rules 2020",
        "content": "Flipkart enforces a 7-day replacement window on mobile phones, laptops, and large appliances. Under Flipkart's Open Box Delivery (OBD) process, delivery agents open outer packaging to verify physical completeness. However, sharing delivery OTP does not waive consumer statutory protection under CPA 2019 if the product has latent internal defects, fails to power on, or displays panel cracking during authorized brand technician installation. Flipkart and the seller cannot pass responsibility to the manufacturer service center for dead-on-arrival products delivered through their platform. If replacement stock is unavailable, Flipkart must immediately issue a 100% refund."
    },

    # --- BRAND POLICIES: AMAZON INDIA ---
    {
        "id": "amazon_india_a_to_z_guarantee",
        "title": "Amazon India - A-to-z Guarantee, 7-Day Electronics Replacement & Wrong Delivery",
        "category": "ecommerce",
        "source": "Amazon Seller Services Pvt. Ltd. Conditions of Sale & A-to-z Guarantee Policy",
        "content": "Amazon.in provides a 7-day replacement policy for electronics and high-value merchandise. The Amazon A-to-z Guarantee protects buyers up to ₹2,50,000 when third-party sellers fail to respond or deliver defective/counterfeit goods. In cases of wrong item delivery (e.g. soap bar or dummy item delivered instead of phone/laptop), unboxing videos, courier shipping weight discrepancies, and delivery photos are sufficient evidence. Marketplace platforms are jointly liable under E-Commerce Rules 2020 Rule 5 for deficient seller fulfillment and cannot arbitrarily close A-to-z claims without substantive investigation."
    },

    # --- FINANCIAL & BANKING: RBI INTEGRATED OMBUDSMAN ---
    {
        "id": "banking_ombudsman_2021",
        "title": "RBI Integrated Ombudsman Scheme 2021 - Unauthorized Digital Transactions & Zero Liability",
        "category": "banking",
        "source": "RBI Master Circular DBR.No.Leg.BC.78/09.07.005/2017-18 & Ombudsman Scheme 2021",
        "content": "Under RBI regulations on Unauthorized Electronic Banking Transactions (UPI, Netbanking, Debit/Credit cards): (1) Zero liability applies to the consumer if fraud occurs due to bank negligence or third-party breach where the customer notifies the bank within 3 working days. (2) If notified within 4 to 7 working days, maximum consumer liability is capped at ₹10,000. (3) The bank must credit the disputed shadow amount to the customer's account within 10 working days of notification. Failure to reverse unauthorized charges constitutes gross deficiency of banking service."
    },
    {
        "id": "subscription_auto_debit_rbi",
        "title": "RBI E-Mandate Framework - Recurring Subscription Auto-Debits",
        "category": "banking",
        "source": "RBI Framework for Processing of e-Mandates on Cards for Recurring Transactions",
        "content": "Under RBI e-mandate guidelines, banks and card issuers are legally mandated to transmit an SMS/email pre-debit notification at least 24 hours prior to any recurring transaction execution. Consumers possess the absolute right to revoke e-mandates anytime through netbanking portals. Any unauthorized subscription debited without mandatory 24-hour pre-debit alert must be refunded immediately by the acquiring bank/merchant."
    },

    # --- TELECOM & UTILITIES: TRAI ---
    {
        "id": "telecom_trai_qos_2019",
        "title": "TRAI Quality of Service & Billing Dispute Redressal (Jio, Airtel, Vi)",
        "category": "telecom",
        "source": "TRAI Telecom Consumers Protection Regulations 2012 & Quality of Service Norms",
        "content": "Telecom service providers (Reliance Jio, Bharti Airtel, Vodafone Idea) must resolve billing disputes within 30 days of registration. Unsolicited Value Added Services (VAS) activated without verifiable double-consent OTP must be refunded within 48 hours. Erroneous tariff charges must be credited back with 12% per annum statutory interest if delay exceeds 60 days. Service disruption without prior notice entitles the subscriber to pro-rata bill rebates."
    },
    {
        "id": "delivery_courier_liability",
        "title": "Carrier & Courier Logistics Liability - Damage or Loss in Transit",
        "category": "delivery",
        "source": "Carriage by Road Act 2007 & Consumer Protection Act 2019 Section 2(11)",
        "content": "Logistics providers (Delhivery, BlueDart, Ekart, Ecom Express, India Post) and e-commerce merchants are strictly liable for parcels lost, stolen, or damaged during transit. Packaging tampered with before delivery or weight discrepancies recorded at hub create a rebuttable presumption of carrier deficiency. Both merchant and logistics partner must jointly ensure immediate reshipment or 100% monetary refund."
    }
]
