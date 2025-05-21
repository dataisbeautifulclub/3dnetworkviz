// js/modelsData.js
const networkModels = {
    osi: {
        name: "OSI Model",
        layers: [
            { id: 7, name: "Application", color: 0xff6347, purpose: "Network process to application. Provides services for user applications.", protocols: "HTTP, FTP, SMTP, DNS", pdu: "Data" },
            { id: 6, name: "Presentation", color: 0xffa07a, purpose: "Data representation, encryption and decryption, compression.", protocols: "SSL, TLS, JPEG, ASCII", pdu: "Data" },
            { id: 5, name: "Session", color: 0xffdab9, purpose: "Interhost communication, managing sessions between applications.", protocols: "NetBIOS, RPC, PPTP", pdu: "Data" },
            { id: 4, name: "Transport", color: 0x90ee90, purpose: "End-to-end connections, reliability and flow control.", protocols: "TCP, UDP", pdu: "Segment/Datagram" },
            { id: 3, name: "Network", color: 0x87cefa, purpose: "Path determination and logical addressing (IP).", protocols: "IP, ICMP, IGMP, OSPF", pdu: "Packet" },
            { id: 2, name: "Data Link", color: 0xadd8e6, purpose: "Physical addressing (MAC) and error detection.", protocols: "Ethernet, PPP, Switch", pdu: "Frame" },
            { id: 1, name: "Physical", color: 0xb0c4de, purpose: "Media, signal and binary transmission.", protocols: "Ethernet (cable), Wi-Fi (radio), Hubs", pdu: "Bits" }
        ]
    },
    // Add more models (e.g., tcpip4, tcpip5) here later
};