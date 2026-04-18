const transportKnowledge = {
    // Transport Management Knowledge Base
    transport: {
        buses: {
            routes: {
                city: [
                    "Guntur City Center - Brodipet, Arundelpet, Patnam Bazar, Kothapet, Lakshmipuram, Srinagar Colony, Nallapadu",
                    "Mangalagiri Route - Mangalagiri, Vijayawada Rural, Guntur Rural, Tadepalle, Thullur",
                    "Tenali Route - Tenali, Ponnur, Bapatla, Chirala",
                    "Narasaraopet Route - Narasaraopet, Piduguralla, Sattenapalle"
                ],
                village: [
                    "Kollipara Village Route - Kollipara, Dachepalle, Veldurthi",
                    "Macherla Village Route - Macherla, Veldurthi, Dachepalle"
                ]
            },
            capacity: "Each bus has capacity for 50-60 passengers",
            timing: "Buses operate from 7:00 AM to 8:00 PM with peak hours 7-9 AM and 4-6 PM"
        },

        fees: {
            structure: {
                city: "₹500 per semester for city routes",
                village: "₹800 per semester for village routes",
                hostelers: "₹300 per semester (shuttle service)"
            },
            payment: "Fees collected at beginning of each semester, late payment penalty ₹100",
            pending: "Students with pending fees may be denied transport services"
        },

        management: {
            assignment: "Buses assigned based on student residence location and capacity",
            monitoring: "GPS tracking and driver attendance monitoring",
            maintenance: "Regular maintenance schedule every 15 days",
            emergency: "Emergency contact numbers available for breakdowns"
        }
    },

    queries: {
        bus_routes: "I can help you find bus routes for different areas in Guntur district",
        fee_payment: "Transport fees are ₹500/semester for city routes and ₹800/semester for village routes",
        bus_timing: "Buses operate from 7:00 AM to 8:00 PM. Check Schedule Manager for exact timings",
        fee_pending: "Contact Transport Manager to clear pending fees. Late payment penalty applies",
        bus_assignment: "Buses are assigned based on your residence location. Check Transport Dashboard"
    },

    responses: {
        greeting: "Hello! I'm your Transport Assistant. I can help with bus routes, fees, timings, and transport management.",

        bus_info: (route) => `The ${route} serves multiple stops. Check the Transport Manager Dashboard for detailed route information.`,

        fee_help: "Transport fees vary by route type. City routes: ₹500/semester, Village routes: ₹800/semester. Hostelers get discounted rates.",

        schedule_help: "Bus timings are managed by the Schedule Manager. Morning buses start at 7:00 AM, evening buses end at 8:00 PM.",

        emergency: "For transport emergencies, contact the Transport Manager immediately or call the emergency helpline."
    }
};

module.exports = transportKnowledge;
