import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/* ==========================================
        PDF REPORT GENERATOR
========================================== */

export const generatePDFReport = (data) => {

    const doc = new jsPDF();

    /* =========================================================
            HEADER
========================================================= */

    const reportId =
        `REP-${new Date().getFullYear()}${(new Date().getMonth()+1)
            .toString().padStart(2,"0")}${new Date().getDate()
            .toString().padStart(2,"0")}-${Math.floor(Math.random()*900+100)}`;

// Purple top strip
    doc.setFillColor(98,52,183);
    doc.rect(0,0,220,36,"F");

// University Name
    doc.setTextColor(255,255,255);
    doc.setFontSize(19);
    doc.setFont("helvetica","bold");

    doc.text(
        "XYZ UNIVERSITY",
        105,
        12,
        {align:"center"}
    );

// Platform Name
    doc.setFontSize(13);

    doc.text(
        "LAB RESOURCE UTILIZATION PLATFORM",
        105,
        20,
        {align:"center"}
    );

// Report Title
    doc.setFontSize(16);

    doc.text(
        data.title.toUpperCase(),
        105,
        30,
        {align:"center"}
    );

    doc.setTextColor(0,0,0);

    let y = 48;

// Left Side
    doc.setFontSize(11);

    doc.setFont("helvetica","bold");
    doc.text(`Report ID :`,14,y);

    doc.setFont("helvetica","normal");
    doc.text(reportId,40,y);

// Right Side
    doc.setFont("helvetica","bold");
    doc.text("Generated :",135,y);

    doc.setFont("helvetica","normal");
    doc.text(new Date().toLocaleString(),165,y);

    y += 8;

    doc.setFont("helvetica","bold");
    doc.text("From :",135,y);

    doc.setFont("helvetica","normal");
    doc.text(
        data.filters.fromDate || "All",
        165,
        y
    );

    y += 7;

    doc.setFont("helvetica","bold");
    doc.text("To :",135,y);

    doc.setFont("helvetica","normal");
    doc.text(
        data.filters.toDate || "All",
        165,
        y
    );

    y += 12;

    /* =========================================================
                DETAILS & SUMMARY CARDS
========================================================= */

// ---------- Left Card ----------

    const leftX = 14;
    const topY = y;

    doc.setDrawColor(180);
    doc.roundedRect(leftX, topY, 86, 50, 3, 3);

    doc.setFillColor(98, 52, 183);
    doc.roundedRect(leftX, topY, 86, 8, 3, 3, "F");

    doc.setTextColor(255,255,255);
    doc.setFontSize(12);
    doc.setFont("helvetica","bold");
    doc.text("RESEARCHER DETAILS", leftX + 43, topY + 5.5, {align:"center"});

    doc.setTextColor(0,0,0);
    doc.setFontSize(10);

    let ly = topY + 15;

    const researcherInfo = [

        ["Name", data.user.name],

        ["Role", data.user.role],

        ["Email", data.user.email],

        ["Department", data.user.department],

        ["Institution", data.user.institution]

    ];

    researcherInfo.forEach(item=>{

        doc.setFont("helvetica","bold");
        doc.text(item[0], leftX+4, ly);

        doc.setFont("helvetica","normal");
        doc.text(": "+(item[1] || "-"), leftX+30, ly);

        ly += 7;

    });


// ---------- Right Card ----------

    const rightX = 110;

    doc.setDrawColor(180);
    doc.roundedRect(rightX, topY, 86, 50, 3, 3);

    doc.setFillColor(98,52,183);
    doc.roundedRect(rightX, topY, 86, 8, 3,3,"F");

    doc.setTextColor(255,255,255);
    doc.setFontSize(12);
    doc.setFont("helvetica","bold");

    doc.text(
        "REPORT SUMMARY",
        rightX+43,
        topY+5.5,
        {align:"center"}
    );

    doc.setTextColor(0,0,0);

    let sy = topY + 15;

    Object.entries(data.summary).forEach(([key,value])=>{

        doc.setFont("helvetica","bold");

        doc.text(key,rightX+4,sy);

        doc.setFont("helvetica","normal");

        doc.text(String(value), rightX+68, sy);

        sy += 7;

    });


    y = topY + 60;

    /* =========================================================
                    BOOKING HISTORY
========================================================= */

    doc.setDrawColor(98,52,183);
    doc.setLineWidth(0.5);

    doc.line(14,y,196,y);

    y += 8;

    doc.setFontSize(16);
    doc.setFont("helvetica","bold");

    doc.text(
        "BOOKING HISTORY",
        105,
        y,
        {align:"center"}
    );

    y += 8;

    doc.line(14,y,196,y);

    y += 6;

    /* ---------- Table ---------- */

    autoTable(doc,{

        startY:y,

        head:[data.columns],

        body:data.rows,

        theme:"grid",

        styles:{

            fontSize:10,

            cellPadding:3,

            halign:"center",

            valign:"middle",

            lineColor:[220,220,220],

            lineWidth:0.2

        },

        headStyles:{

            fillColor:[98,52,183],

            textColor:[255,255,255],

            fontStyle:"bold",

            halign:"center"

        },

        bodyStyles:{

            textColor:[40,40,40]

        },

        alternateRowStyles:{

            fillColor:[248,248,248]

        },

        margin:{
            left:14,
            right:14
        }

    });

    /* ---------- Footer ---------- */

    const pageCount = doc.internal.getNumberOfPages();

    for(let i=1;i<=pageCount;i++){

        doc.setPage(i);

        doc.setDrawColor(180);

        doc.line(14,285,196,285);

        doc.setFontSize(9);

        doc.setTextColor(110);

        doc.text(

            "This report is system generated by Lab Resource Utilization Platform.",

            14,

            290

        );

        doc.text(

            "XYZ University",

            14,

            295

        );

        doc.text(

            `Page ${i} of ${pageCount}`,

            175,

            292

        );

    }
    doc.save(`${data.title}.pdf`);

};

/* ==========================================
        EXCEL REPORT GENERATOR
========================================== */

export const generateExcelReport = (data) => {

    const worksheet = XLSX.utils.aoa_to_sheet([]);

    /* ---------- Heading ---------- */

    XLSX.utils.sheet_add_aoa(

        worksheet,

        [

            [data.title],

            [],

            ["Name",data.user.name],

            ["Role",data.user.role],

            ["Email",data.user.email],

            ["Department",data.user.department],

            ["Institution",data.user.institution],

            [],

            ["Report Summary"],

            ...Object.entries(data.summary),

            [],

            ["Applied Filters"],

            ["From Date",data.filters.fromDate || "All"],

            ["To Date",data.filters.toDate || "All"],

            ["Status",data.filters.status],

            ["Equipment",data.filters.equipment],

            ["Search",data.filters.search || "-"],

            []

        ],

        {

            origin:"A1"

        }

    );

    /* ---------- Table ---------- */

    const startRow = 20;

// Add column headers
    XLSX.utils.sheet_add_aoa(
        worksheet,
        [data.columns],
        {
            origin: `A${startRow}`
        }
    );

// Add table rows
    XLSX.utils.sheet_add_aoa(
        worksheet,
        data.rows,
        {
            origin: `A${startRow + 1}`
        }
    );

    worksheet["!cols"]=[

        {wch:15},

        {wch:25},

        {wch:30},

        {wch:25},

        {wch:25},

        {wch:18}

    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Report"

    );

    XLSX.writeFile(

        workbook,

        `${data.title}.xlsx`

    );


};