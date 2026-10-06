import asyncio
import os
import sys
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import dotenv

# Load environment variables
dotenv.load_dotenv()

DEMO_USER_ID = "6a63032400ff5e28a50d703c"
DEMO_USER_ALT = "demo-user-id"

INDIAN_CASES_DATA = [
    {
        "title": "HP Pavilion Laptop - Motherboard Failure & False CID Warranty Denial",
        "description": "Purchased an HP Pavilion 15 (Model: 15-eg2000TU, S/N: 5CD2489K1L) on Flipkart during sale for ₹68,990 with 1-Year HP Onsite Warranty. After 45 days of routine indoor use, the laptop suffered sudden power cutoff and failed to boot or charge. HP Authorized Service Center in Bengaluru (Koramangala) technician inspected the unit and falsely classified the defect as 'Customer Induced Damage (CID) / Liquid Ingress' to void the manufacturer warranty, demanding ₹34,500 for a motherboard replacement. The motherboard has never been exposed to liquids. Flipkart refused intervention citing expiry of their 7-day return window. Both HP India and Flipkart are denying warranty remedy under CPA 2019 Section 84.",
        "category": "electronics",
        "issue_type": "warranty_dispute",
        "desired_resolution": "Free Motherboard Replacement under Warranty or 100% Full Refund of ₹68,990",
        "vendor_name": "HP India & Flipkart Internet Pvt Ltd",
        "claimed_amount": "₹68,990",
        "status": "preparing",
        "transaction_id": "OD4092817291823000",
        "purchase_date": "2026-08-14",
        "summary": "HP India Authorized Service Center wrongfully denied warranty on an HP Pavilion 15 laptop by citing unverified liquid damage (CID), demanding ₹34,500 for motherboard replacement within the 1-year warranty period. Flipkart disclaimed liability after 7 days.",
        "key_facts": [
            "Laptop purchased on Flipkart on 14 Aug 2026 for ₹68,990 with valid GST invoice",
            "1-Year HP Limited Hardware Onsite Warranty active until August 2027",
            "Sudden logic board failure occurred within 45 days without external damage",
            "HP ASC falsely claimed liquid ingress without photographic or microscopic evidence",
            "Refusal to replace or repair violates CPA 2019 Section 84(1)(a) & (d)"
        ],
        "user_answers": {
            "Do you have the original purchase invoice and warranty card?": "Yes, Flipkart GST Tax Invoice No. FA-2026-88192 and HP warranty registration confirmation are intact.",
            "Did the service center issue a written inspection report or job sheet?": "Yes, Job Sheet No. HP-BLR-89218 states 'CID suspected' without specifying moisture corrosion proof.",
            "Have you escalated this to HP India Nodal Grievance Office?": "Yes, ticket raised on hp.com/in grievance portal (Ref #HP-IN-49219), no resolution for 21 days."
        },
        "days_ago": 12,
        "timeline_events": [
            {"event_type": "purchase", "description": "HP Pavilion 15 purchased on Flipkart for ₹68,990 (Invoice #FA-2026-88192).", "days_ago": 48},
            {"event_type": "defect_manifested", "description": "Laptop powered down abruptly; charging LED indicator unresponsive.", "days_ago": 15},
            {"event_type": "service_center_visit", "description": "HP ASC Koramangala inspected device and issued CID quote for ₹34,500.", "days_ago": 12},
            {"event_type": "escalation", "description": "Escalated to HP India Executive Escalation Team and Flipkart Customer Support.", "days_ago": 8},
            {"event_type": "rag_guidance_generated", "description": "AI Legal Guidance generated under CPA 2019 Section 84 (Product Liability).", "days_ago": 2}
        ],
        "evidence_docs": [
            {"filename": "Flipkart_Tax_Invoice_HP_Pavilion.pdf", "type": "invoice", "size": 184200},
            {"filename": "HP_Authorized_Job_Sheet_89218.pdf", "type": "company_response", "size": 95400},
            {"filename": "Laptop_Undamaged_Exterior_Photos.jpg", "type": "product_photo", "size": 420100}
        ]
    },
    {
        "title": "Acer Nitro 5 Gaming Laptop - Hinge Structural Failure & DOA Runaround",
        "description": "Purchased an Acer Nitro 5 Gaming Laptop (Core i5, RTX 3050, Invoice #AMZ-992014) on Amazon.in for ₹74,500. On the 4th day following delivery, the right hinge cracked and seized while opening the screen under normal use, pinching the display ribbon cable and causing flickering. Reported immediately to Amazon within the 7-day return window. Amazon refused replacement without an Acer Dead On Arrival (DOA) certificate. Acer ASC in Mumbai delayed inspection for 18 days and then claimed hinge cracking is 'physical damage' excluded from warranty. Acer chassis hinge flaws are well-documented mechanical design defects.",
        "category": "electronics",
        "issue_type": "defective_product",
        "desired_resolution": "Immediate Unit Replacement with Fresh 1-Year Warranty or ₹74,500 Refund",
        "vendor_name": "Acer India Pvt Ltd & Amazon Seller Services",
        "claimed_amount": "₹74,500",
        "status": "preparing",
        "transaction_id": "408-2918201-9281928",
        "purchase_date": "2026-09-02",
        "summary": "Acer Nitro 5 laptop hinge cracked on Day 4 of purchase. Amazon denied replacement without an Acer DOA certificate, while Acer ASC refused DOA certification citing physical damage, violating CPA 2019 Section 84(1)(b) design defect liability.",
        "key_facts": [
            "Delivered on 02 Sep 2026 via Amazon.in from seller Appario Retail for ₹74,500",
            "Hinge failure occurred on Day 4 within statutory 7-day return window",
            "Amazon refused 7-day replacement without Acer service center DOA certificate",
            "Acer ASC delayed technician inspection by 18 days, exceeding reasonable SLA",
            "Chassis hinge fatigue represents inherent design defect under CPA 2019 Section 84"
        ],
        "user_answers": {
            "Did you document the hinge issue with photographs immediately upon occurrence?": "Yes, clear high-resolution photos and unboxing timestamp video are recorded.",
            "Did Amazon customer support acknowledge the complaint within 7 days?": "Yes, Amazon chat transcript #AMZ-TKT-99104 confirms initial report on Day 4."
        },
        "days_ago": 20,
        "timeline_events": [
            {"event_type": "purchase", "description": "Acer Nitro 5 delivered by Amazon.in (Order #408-2918201-9281928).", "days_ago": 26},
            {"event_type": "defect_manifested", "description": "Right hinge cracked; display cable pinched and flickering.", "days_ago": 22},
            {"event_type": "amazon_escalation", "description": "Amazon return requested; seller demanded Acer DOA certificate.", "days_ago": 21},
            {"event_type": "service_visit", "description": "Acer technician inspection call logged (Call #ACER-MUM-44019).", "days_ago": 18},
            {"event_type": "refusal_noted", "description": "Acer ASC rejected DOA letter alleging chassis damage.", "days_ago": 5}
        ],
        "evidence_docs": [
            {"filename": "Amazon_Invoice_Acer_Nitro5.pdf", "type": "invoice", "size": 210400},
            {"filename": "Cracked_Hinge_Macro_Photos.jpg", "type": "product_photo", "size": 650000},
            {"filename": "Amazon_Customer_Service_Chat_Export.pdf", "type": "company_response", "size": 132000}
        ]
    },
    {
        "title": "Samsung Galaxy S23 - Persistent Green Line Display Defect post One UI Update",
        "description": "Own a Samsung Galaxy S23 (8GB/256GB, Phantom Black, IMEI: 864019283719283) purchased for ₹54,999. Immediately following the official Samsung One UI software update over-the-air, a bright vertical green line appeared down the center of the Dynamic AMOLED display. The phone has never been dropped, has zero scratches, and the liquid damage indicator inside the SIM tray is completely white. Samsung Authorized Service Center (Jubilee Hills, Hyderabad) refused free repair and quoted ₹14,500 for a screen replacement because the device is 14 days past the 1-year warranty, despite the fault being directly caused by Samsung's software update.",
        "category": "electronics",
        "issue_type": "defective_product",
        "desired_resolution": "Complimentary AMOLED Display Replacement or Refund of ₹54,999",
        "vendor_name": "Samsung India Electronics Pvt Ltd",
        "claimed_amount": "₹54,999",
        "status": "preparing",
        "transaction_id": "SM-HYD-2026-9921",
        "purchase_date": "2026-05-18",
        "summary": "Samsung Galaxy S23 developed a persistent vertical green line across the AMOLED display immediately after installing Samsung's official firmware update. Samsung ASC demanded ₹14,500 for display replacement, ignoring manufacturer liability under CPA 2019 Section 84.",
        "key_facts": [
            "Phone maintained in pristine condition with tempered glass and protective case",
            "Green line appeared spontaneously upon restart after official One UI OTA update",
            "Moisture indicators (LDI) are untripped; zero physical impact marks",
            "Samsung has documented service programs for display line issues caused by updates",
            "Demanding ₹14,500 violates manufacturer product liability under CPA 2019"
        ],
        "user_answers": {
            "Did the display line appear right after the system update?": "Yes, the phone rebooted to complete the update and the green line appeared on the lock screen.",
            "Do you have the Samsung service center job sheet?": "Yes, Job Sheet #HYD-SAM-55210 diagnosing AMOLED panel fault."
        },
        "days_ago": 9,
        "timeline_events": [
            {"event_type": "update_installed", "description": "Official Samsung One UI security & feature update downloaded and installed.", "days_ago": 11},
            {"event_type": "defect_manifested", "description": "Vertical green line appeared across entire AMOLED screen height.", "days_ago": 11},
            {"event_type": "service_visit", "description": "Visited Samsung Smart Care Jubilee Hills; repair quote ₹14,500 issued.", "days_ago": 9},
            {"event_type": "rag_guidance_generated", "description": "Statutory guidance retrieved on software-induced product defects.", "days_ago": 1}
        ],
        "evidence_docs": [
            {"filename": "Samsung_S23_Original_Tax_Invoice.pdf", "type": "invoice", "size": 156000},
            {"filename": "Display_Green_Line_Photo.jpg", "type": "product_photo", "size": 390000},
            {"filename": "Samsung_Service_Center_Estimate_HYD55210.pdf", "type": "company_response", "size": 89000}
        ]
    },
    {
        "title": "Apple iPhone 15 Pro - Battery Drain & Refusal to Honor DOA Replacement",
        "description": "Purchased an Apple iPhone 15 Pro 128GB Natural Titanium for ₹1,34,900 from an Apple Authorized Reseller (Imagine Store, Pune). Within 48 hours of unboxing, the device began exhibiting extreme thermal heating (reaching 46.2°C under normal ambient conditions) and battery draining from 100% to 0% in under 4 hours on standby with no background apps running. Submitted the unit to Apple Authorised Service Provider (AASP Tresor Systems) within 5 days of purchase requesting Dead On Arrival (DOA) replacement. AASP ran automated diagnostic software, declared 'Battery Health 100%, No hardware error code' and refused unit replacement despite the device being dangerously hot and unusable.",
        "category": "electronics",
        "issue_type": "defective_product",
        "desired_resolution": "Brand New Sealed Replacement Unit or Full Refund of ₹1,34,900",
        "vendor_name": "Apple India Pvt Ltd & Imagine Store Pune",
        "claimed_amount": "₹1,34,900",
        "status": "preparing",
        "transaction_id": "IMG-PUN-2026-4401",
        "purchase_date": "2026-09-12",
        "summary": "Apple iPhone 15 Pro suffers from extreme overheating and rapid battery discharge out of the box. AASP refused DOA replacement based on superficial diagnostic tools, violating CPA 2019 Section 84 product fitness standards.",
        "key_facts": [
            "Purchased from authorized reseller on 12 Sep 2026 for ₹1,34,900",
            "Reported severe overheating (46.2°C) and battery failure within 5 days",
            "AASP refused DOA replacement citing automated system pass",
            "Device unfit for ordinary consumer use under CPA 2019 Section 2(34)",
            "Apple India is liable for defective battery/logic board assembly under Section 84"
        ],
        "user_answers": {
            "Have you captured temperature logs or battery usage screenshots?": "Yes, iOS battery analytics screenshots and laser thermometer readings are preserved.",
            "Did you request escalation to Apple India Senior Technical Support?": "Yes, Apple Support Case ID #102948192837 is open with no resolution."
        },
        "days_ago": 16,
        "timeline_events": [
            {"event_type": "purchase", "description": "Purchased sealed iPhone 15 Pro at Imagine Store Pune.", "days_ago": 21},
            {"event_type": "defect_manifested", "description": "Phone overheated during charging and setup; battery drained within 4 hours.", "days_ago": 19},
            {"event_type": "service_visit", "description": "Deposited device at AASP Tresor Systems Pune for DOA inspection.", "days_ago": 16},
            {"event_type": "rejection", "description": "AASP returned unit without replacement citing diagnostic pass.", "days_ago": 12}
        ],
        "evidence_docs": [
            {"filename": "Imagine_Apple_Tax_Invoice_Pune.pdf", "type": "invoice", "size": 245000},
            {"filename": "AASP_Diagnostic_Work_Order_PUN992.pdf", "type": "company_response", "size": 112000},
            {"filename": "Battery_Drain_Analytics_Screenshots.png", "type": "screenshot", "size": 512000}
        ]
    },
    {
        "title": "Flipkart - Damaged 55-inch 4K TV on Open Box Delivery (OBD) Trap",
        "description": "Ordered a 55-inch 4K Ultra HD Smart TV for ₹32,999 on Flipkart (Order #OD32819284719283000). The delivery agent insisted on receiving the delivery verification OTP before unboxing the carton, stating 'Company rules require OTP verification prior to unpacking large parcels'. Upon unboxing during technician installation 3 hours later, the inner panel was found shattered with internal LED bleed. When I contacted Flipkart within 4 hours of delivery, customer support summarily rejected the replacement request claiming that 'Sharing the OTP confirms verified open box delivery with zero transit damage'. Coercing delivery OTP before testing violates Consumer Protection (E-Commerce) Rules 2020.",
        "category": "ecommerce",
        "issue_type": "refund_not_received",
        "desired_resolution": "Immediate 100% Full Refund of ₹32,999 to Source Bank Account",
        "vendor_name": "Flipkart Internet Pvt Ltd",
        "claimed_amount": "₹32,999",
        "status": "preparing",
        "transaction_id": "OD32819284719283000",
        "purchase_date": "2026-09-20",
        "summary": "Flipkart delivery agent coerced OTP before unboxing a 55-inch Smart TV which was discovered fractured upon technician installation. Flipkart denied return/refund citing OTP verification, violating E-Commerce Rules 2020 Rule 6 and CPA 2019 Section 2(47).",
        "key_facts": [
            "Delivered on 20 Sep 2026 in Lucknow for ₹32,999",
            "Delivery boy coerced OTP before opening internal protective foam",
            "Authorized installation technician verified shattered internal LCD panel on same day",
            "Flipkart customer care closed replacement ticket without physical re-inspection",
            "E-Commerce Rules 2020 Rule 6 strictly prohibits unfair return disclaimers"
        ],
        "user_answers": {
            "Do you have the technician installation job sheet confirming pre-existing damage?": "Yes, Brand Installation Engineer Job Sheet #TECH-LKO-441 explicitly states: 'Panel found broken inside sealed packing upon arrival'.",
            "Did you capture unboxing photos and videos?": "Yes, continuous video from technician arrival to power-on test is recorded."
        },
        "days_ago": 14,
        "timeline_events": [
            {"event_type": "delivery", "description": "TV delivered at Lucknow residence; delivery boy demanded OTP at door.", "days_ago": 14},
            {"event_type": "installation_inspection", "description": "Brand technician arrived; screen panel revealed broken inside.", "days_ago": 14},
            {"event_type": "complaint_filed", "description": "Raised grievance with Flipkart App customer support with technician slip.", "days_ago": 14},
            {"event_type": "rejection", "description": "Flipkart closed dispute claiming OBD was completed.", "days_ago": 12}
        ],
        "evidence_docs": [
            {"filename": "Flipkart_Order_Summary_OD32819284.pdf", "type": "order_confirmation", "size": 178000},
            {"filename": "Brand_Installation_Technician_Report.pdf", "type": "company_response", "size": 142000},
            {"filename": "Shattered_Display_Panel_Photo.jpg", "type": "product_photo", "size": 780000}
        ]
    },
    {
        "title": "Amazon India - Wrong Product Delivered & A-to-z Claim Arbitrarily Denied",
        "description": "Ordered Sony WH-1000XM5 Wireless Noise Cancelling Headphones on Amazon.in for ₹26,990 from seller RetailNet (Order #402-8819203-1029482). The package arrived with the outer security tape visibly restuck. Upon opening the parcel on camera, the box contained two 150g laundry detergent bars instead of the headphones. Shipping manifest label listed shipping weight as 1.15 kg, whereas the delivered package weighed only 340 grams. Amazon A-to-z Guarantee claim was filed with full unboxing video and weighing scale photo. Amazon closed the dispute after 48 hours stating 'Carrier confirms correct weight delivered', refusing refund or replacement in violation of E-Commerce Rules 2020 Rule 5.",
        "category": "ecommerce",
        "issue_type": "refund_not_received",
        "desired_resolution": "Full Refund of ₹26,990 under Amazon A-to-z Guarantee Policy",
        "vendor_name": "Amazon Seller Services Pvt Ltd",
        "claimed_amount": "₹26,990",
        "status": "preparing",
        "transaction_id": "402-8819203-1029482",
        "purchase_date": "2026-09-28",
        "summary": "Amazon India delivered detergent soap instead of Sony premium headphones (₹26,990) and denied the A-to-z claim despite clear unboxing video and gross weight discrepancies. Joint marketplace liability under E-Commerce Rules 2020 applies.",
        "key_facts": [
            "Ordered high-value Sony headphones for ₹26,990 on Amazon.in",
            "Delivered parcel contained detergent bars; tampered outer packaging tape",
            "Unboxing video recorded without cuts showing shipping label and package opening",
            "Gross weight discrepancy: Label states 1.15kg, actual contents weigh 340g",
            "Amazon refused A-to-z claim without reviewing CCTV or hub transit logs"
        ],
        "user_answers": {
            "Did you provide the unboxing video link to Amazon customer support?": "Yes, uploaded to cloud drive and provided in A-to-z Guarantee claim form.",
            "Have you filed a complaint with the National Consumer Helpline?": "Docketed on consumerhelpline.gov.in (Docket #NCH-2026-992014)."
        },
        "days_ago": 7,
        "timeline_events": [
            {"event_type": "order_placed", "description": "Ordered Sony WH-1000XM5 headphones on Amazon.in.", "days_ago": 10},
            {"event_type": "delivery", "description": "Package delivered; recorded unboxing video showing soap bars.", "days_ago": 7},
            {"event_type": "claim_filed", "description": "Amazon A-to-z Guarantee claim filed with video evidence and weights.", "days_ago": 7},
            {"event_type": "claim_rejected", "description": "Amazon rejected claim citing carrier delivery confirmation.", "days_ago": 5}
        ],
        "evidence_docs": [
            {"filename": "Amazon_Tax_Invoice_Sony_Headphones.pdf", "type": "invoice", "size": 195000},
            {"filename": "Delivered_Soap_Bar_Photo.jpg", "type": "product_photo", "size": 610000},
            {"filename": "Shipping_Weight_Discrepancy_Photo.jpg", "type": "product_photo", "size": 430000}
        ]
    },
    {
        "title": "HDFC Bank - Unauthorized Recurring UPI Auto-Debit without RBI Pre-Debit SMS",
        "description": "Three consecutive unauthorized recurring transactions of ₹4,999.66 each (₹14,999 total) were debited from my HDFC Bank Savings Account via an unknown merchant UPI e-mandate. HDFC Bank failed to send the mandatory 24-hour advance pre-debit SMS/email notification mandated under the RBI E-Mandate Framework for Recurring Transactions. I lodged a formal dispute with HDFC Bank grievance cell within 18 hours of the transactions occurring (well within the RBI 3-day zero customer liability window). The bank has failed to reverse the disputed shadow amount within 10 working days, violating RBI Integrated Ombudsman Scheme 2021 norms.",
        "category": "banking",
        "issue_type": "incorrect_charge",
        "desired_resolution": "Immediate Full Reversal of ₹14,999 Disputed Debits & Permanent Mandate Revocation",
        "vendor_name": "HDFC Bank Ltd",
        "claimed_amount": "₹14,999",
        "status": "preparing",
        "transaction_id": "UPI-REF-429184029182",
        "purchase_date": "2026-10-01",
        "summary": "HDFC Bank permitted unauthorized UPI auto-debits totaling ₹14,999 without sending the mandatory 24-hour pre-debit alert under RBI guidelines, and failed to credit shadow funds within the statutory 10-day period.",
        "key_facts": [
            "Three unauthorized debits of ₹4,999.66 occurred on 01 Oct 2026",
            "Zero 24-hour advance pre-debit notification received on registered mobile number",
            "Dispute formally docketed with HDFC Bank within 18 hours (Zero Liability applies)",
            "Bank failed to credit shadow amount within statutory 10 working days",
            "Violates RBI Integrated Ombudsman Scheme 2021 & Circular DBR.No.Leg.BC.78"
        ],
        "user_answers": {
            "Did you share any OTP or UPI PIN with anyone for these transactions?": "No, no OTP or PIN was requested or shared; transactions were executed as background e-mandates.",
            "Do you have the bank statement highlighting the disputed transactions?": "Yes, HDFC account statement reflecting the 3 debits is attached."
        },
        "days_ago": 5,
        "timeline_events": [
            {"event_type": "unauthorized_debit", "description": "Three unauthorized debits of ₹4,999.66 executed via UPI.", "days_ago": 5},
            {"event_type": "bank_complaint", "description": "Reported to HDFC PhoneBanking & filed chargeback dispute (SR #8819201).", "days_ago": 5},
            {"event_type": "mandate_cancellation", "description": "Revoked all auto-debit authorizations on HDFC NetBanking.", "days_ago": 4},
            {"event_type": "ombudsman_escalation", "description": "Formal notice prepared for RBI Banking Ombudsman CMS portal.", "days_ago": 1}
        ],
        "evidence_docs": [
            {"filename": "HDFC_Bank_Statement_Disputed_Debits.pdf", "type": "receipt", "size": 320000},
            {"filename": "HDFC_Grievance_Docket_Receipt_SR8819201.pdf", "type": "company_response", "size": 115000}
        ]
    }
]

async def seed_database():
    mongo_uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("MONGODB_DATABASE", "grievance_db")
    print(f"Connecting to MongoDB Atlas ({db_name})...")
    client = AsyncIOMotorClient(mongo_uri)
    db = client[db_name]

    # Clean existing cases for demo user
    demo_oid = ObjectId(DEMO_USER_ID)
    delete_result = await db.cases.delete_many({
        "$or": [
            {"user_id": demo_oid},
            {"user_id": DEMO_USER_ID},
            {"user_id": DEMO_USER_ALT}
        ]
    })
    print(f"Removed {delete_result.deleted_count} old demo cases.")

    # Also clean demo user's timeline and evidence collections
    await db.timeline_events.delete_many({
        "$or": [
            {"user_id": demo_oid},
            {"user_id": DEMO_USER_ID},
            {"user_id": DEMO_USER_ALT}
        ]
    })
    await db.evidence.delete_many({
        "$or": [
            {"user_id": demo_oid},
            {"user_id": DEMO_USER_ID},
            {"user_id": DEMO_USER_ALT}
        ]
    })

    now = datetime.now(timezone.utc)

    for idx, cdata in enumerate(INDIAN_CASES_DATA, 1):
        case_created_at = now - timedelta(days=cdata["days_ago"])
        case_doc = {
            "user_id": demo_oid,
            "title": cdata["title"],
            "description": cdata["description"],
            "category": cdata["category"],
            "issue_type": cdata["issue_type"],
            "desired_resolution": cdata["desired_resolution"],
            "vendor_name": cdata["vendor_name"],
            "claimed_amount": cdata["claimed_amount"],
            "transaction_id": cdata["transaction_id"],
            "purchase_date": cdata["purchase_date"],
            "status": cdata["status"],
            "summary": cdata["summary"],
            "key_facts": cdata["key_facts"],
            "user_answers": cdata["user_answers"],
            "created_at": case_created_at,
            "updated_at": case_created_at + timedelta(days=1)
        }
        res = await db.cases.insert_one(case_doc)
        case_id = res.inserted_id

        # Insert timeline events
        for tev in cdata.get("timeline_events", []):
            tev_time = now - timedelta(days=tev["days_ago"])
            await db.timeline_events.insert_one({
                "case_id": case_id,
                "user_id": demo_oid,
                "event_type": tev["event_type"],
                "description": tev["description"],
                "created_at": tev_time
            })

        # Insert mock evidence items
        for edoc in cdata.get("evidence_docs", []):
            await db.evidence.insert_one({
                "case_id": str(case_id),
                "user_id": str(demo_oid),
                "original_filename": edoc["filename"],
                "storage_key": f"evidence/{case_id}/{edoc['filename']}",
                "file_url": f"/storage/evidence/{case_id}/{edoc['filename']}",
                "mime_type": "application/pdf" if edoc["filename"].endswith(".pdf") else "image/jpeg",
                "size_bytes": edoc["size"],
                "evidence_type": edoc["type"],
                "processing_status": "verified",
                "created_at": case_created_at
            })

        print(f"[{idx}/{len(INDIAN_CASES_DATA)}] Seeded: {cdata['title'][:55]}... ({cdata['vendor_name']})")

    print(f"\nSuccessfully seeded all {len(INDIAN_CASES_DATA)} authentic Indian consumer grievance cases into MongoDB!")

if __name__ == "__main__":
    asyncio.run(seed_database())
