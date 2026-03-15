import React, { useState, useEffect, useRef } from 'react';
import { 
  FiDollarSign, FiCalendar, FiUsers, FiStar, FiDownload, FiFileText
} from 'react-icons/fi';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { appointmentService, dashboardService } from '../../services/api';
import './Reports.css';

// Sofistike, daha profesyonel ("insan yapımı" hissi veren) bir renk paleti.
const PIE_COLORS = ['#3b82f6', '#10b981', '#6366f1', '#8b5cf6', '#f43f5e', '#f59e0b'];

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Örn: "2026-03"
  const reportsRef = useRef(null);

  useEffect(() => {
    fetchData(selectedMonth);
  }, [selectedMonth]);

  const fetchData = async (monthStr) => {
    try {
      setLoading(true);
      
      const [year, month] = monthStr.split('-');
      // Seçilen ayın ilk günü ve son günü
      const start = new Date(year, parseInt(month) - 1, 1);
      const end = new Date(year, parseInt(month), 0); 
      
      // UTC saat dilimi hatalarını önlemek için manuel formatlama (YYYY-MM-DD)
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = `${year}-${month.padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

      const [appointmentsRes, statsRes] = await Promise.all([
        appointmentService.getAll({ startDate, endDate }),
        dashboardService.getStats()
      ]);

      if (appointmentsRes.data?.success && statsRes.data?.success) {
        const appointments = appointmentsRes.data.data;
        const stats = statsRes.data.data;
        processData(appointments, stats);
      }
    } catch (error) {
      console.error('Rapor hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const processData = (appointments, stats) => {
    // 1. Özet Sayılar
    const totalRevenue = appointments.reduce((sum, app) => sum + (app.price || 0), 0);
    const totalAppointments = appointments.length;
    
    // 2. Günlük Trend (Sadece randevusu olan günleri veya o ayki tüm günleri gösterebiliriz)
    const dailyMap = {};
    appointments.forEach(app => {
      if(!app.date) return;
      const dateObj = new Date(app.date);
      if(isNaN(dateObj)) return;

      const dateStr = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      
      if (!dailyMap[dateStr]) dailyMap[dateStr] = { dateStr, ciro: 0, randevu: 0 };
      dailyMap[dateStr].ciro += app.price || 0;
      dailyMap[dateStr].randevu += 1;
    });
    
    const trendData = Object.values(dailyMap);

    // 3. Hizmet Dağılımı (Pie Chart)
    const serviceMap = {};
    appointments.forEach(app => {
      const sName = app.serviceId?.name || 'Diğer Hizmetler';
      if(!serviceMap[sName]) serviceMap[sName] = { name: sName, value: 0 };
      serviceMap[sName].value += 1;
    });
    const serviceData = Object.values(serviceMap);

    // 4. Personel Performansı (Bar Chart)
    const staffMap = {};
    appointments.forEach(app => {
      const sName = app.staffId?.name || 'Genel';
      if(!staffMap[sName]) staffMap[sName] = { name: sName, randevu: 0, ciro: 0 };
      staffMap[sName].randevu += 1;
      staffMap[sName].ciro += app.price || 0;
    });
    const staffData = Object.values(staffMap).sort((a,b) => b.ciro - a.ciro);

    setReportData({
      summary: {
        revenue: totalRevenue,
        appointments: totalAppointments,
        customers: stats.totalCustomers,
        newAppointments: stats.todaysAppointmentsCount
      },
      trendData,
      serviceData,
      staffData
    });
  };

  const downloadPDF = async () => {
    if (!reportsRef.current) return;
    try {
      const canvas = await html2canvas(reportsRef.current, { scale: 2, backgroundColor: '#111827' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'px', [canvas.width / 2, canvas.height / 2]);
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`rapor-${selectedMonth}.pdf`);
    } catch (e) {
      console.error(e);
      alert('PDF oluşturulamadı');
    }
  };

  const getCsvData = () => {
    if(!reportData) return [];
    return reportData.trendData.map(d => ({
      Tarih: d.dateStr,
      'Ciro (TL)': d.ciro,
      'Randevu Sayısı': d.randevu
    }));
  };

  const formatMonthName = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  };

  // Recharts Custom Tooltip for elegance
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rep-custom-tooltip">
          <p className="rep-tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="rep-tooltip-row">
              <span className="rep-tooltip-color" style={{ backgroundColor: entry.color }}></span>
              <span className="rep-tooltip-name">{entry.name}</span>
              <span className="rep-tooltip-value">
                {entry.name.includes("Ciro") ? `${entry.value.toLocaleString('tr-TR')} ₺` : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading && !reportData) {
    return (
      <div className="rep-loading">
        <div className="rep-spinner"></div>
      </div>
    );
  }

  return (
    <div className="rep-container" ref={reportsRef}>
      
      {/* Header Area */}
      <header className="rep-header">
        <div className="rep-header-left">
          <h1 className="rep-title">Raporlar & Analiz</h1>
          <p className="rep-subtitle">{formatMonthName(selectedMonth)} dönemine ait finansal ve operasyonel veriler</p>
        </div>
        
        <div className="rep-controls">
          <div className="rep-month-picker-wrapper">
            <FiCalendar className="rep-month-icon" />
            <input 
              type="month" 
              className="rep-month-input" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          
          <div className="rep-export-group">
            <CSVLink data={getCsvData()} filename={`rapor-${selectedMonth}.csv`} className="rep-btn rep-btn-outline" target="_blank">
               <FiFileText size={15} /> <span>CSV</span>
            </CSVLink>
            <button onClick={downloadPDF} className="rep-btn rep-btn-solid">
               <FiDownload size={15} /> <span>PDF İndir</span>
            </button>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="rep-kpi-grid">
         <div className="rep-kpi-card">
           <div className="rep-kpi-header">
             <span className="rep-kpi-label">Dönem Cirosu</span>
             <FiDollarSign className="rep-kpi-icon" />
           </div>
           <div className="rep-kpi-value">{reportData?.summary.revenue.toLocaleString('tr-TR')} ₺</div>
         </div>
         <div className="rep-kpi-card">
           <div className="rep-kpi-header">
             <span className="rep-kpi-label">Toplam Randevu</span>
             <FiCalendar className="rep-kpi-icon" />
           </div>
           <div className="rep-kpi-value">{reportData?.summary.appointments}</div>
         </div>
         <div className="rep-kpi-card">
           <div className="rep-kpi-header">
             <span className="rep-kpi-label">Veritabanı Müşteri</span>
             <FiUsers className="rep-kpi-icon" />
           </div>
           <div className="rep-kpi-value">{reportData?.summary.customers}</div>
         </div>
         <div className="rep-kpi-card">
           <div className="rep-kpi-header">
             <span className="rep-kpi-label">Bugünkü Bekleyen</span>
             <FiStar className="rep-kpi-icon" />
           </div>
           <div className="rep-kpi-value">{reportData?.summary.newAppointments}</div>
         </div>
      </div>

      {/* Main Charts */}
      {reportData && reportData.trendData.length > 0 ? (
        <div className="rep-charts-layout">
           
           {/* Revenue Trend Chart */}
           <div className="rep-chart-box">
             <div className="rep-chart-header">
               <h2>Finansal Büyüme Trendi</h2>
             </div>
             <div className="rep-chart-body">
               <ResponsiveContainer width="100%" height={260}>
                 <AreaChart data={reportData.trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="gradientCiro" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="4 4" stroke="#374151" vertical={false} />
                   <XAxis dataKey="dateStr" stroke="#6b7280" fontSize={11} tickMargin={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}₺`} />
                   <Tooltip content={<CustomTooltip />} />
                   <Area type="monotone" dataKey="ciro" name="Ciro" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#gradientCiro)" activeDot={{ r: 6, fill: '#3b82f6', stroke: '#111827', strokeWidth: 2 }} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           </div>

           {/* Appointment Trend Chart */}
           <div className="rep-chart-box">
             <div className="rep-chart-header">
               <h2>Randevu Trendi</h2>
             </div>
             <div className="rep-chart-body">
               <ResponsiveContainer width="100%" height={260}>
                 <AreaChart data={reportData.trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="gradientRandevu" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="4 4" stroke="#374151" vertical={false} />
                   <XAxis dataKey="dateStr" stroke="#6b7280" fontSize={11} tickMargin={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                   <Tooltip content={<CustomTooltip />} />
                   <Area type="monotone" dataKey="randevu" name="Randevu Sayısı" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#gradientRandevu)" activeDot={{ r: 6, fill: '#10b981', stroke: '#111827', strokeWidth: 2 }} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           </div>

           {/* Service Distribution Pie */}
           <div className="rep-chart-box">
             <div className="rep-chart-header">
               <h2>Hizmet Dağılımı</h2>
             </div>
             <div className="rep-chart-body pie-body">
               <ResponsiveContainer width="100%" height={260}>
                 <PieChart>
                   <Pie
                     data={reportData.serviceData}
                     innerRadius={65}
                     outerRadius={90}
                     paddingAngle={2}
                     dataKey="value"
                     stroke="none"
                   >
                     {reportData.serviceData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip content={<CustomTooltip />} />
                 </PieChart>
               </ResponsiveContainer>
               <div className="rep-custom-legend">
                 {reportData.serviceData.map((entry, idx) => (
                   <div className="rep-legend-item" key={idx}>
                     <span className="dot" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                     <span className="label">{entry.name}</span>
                     <span className="val">{entry.value}</span>
                   </div>
                 ))}
               </div>
             </div>
           </div>

           {/* Staff Bar Chart */}
           <div className="rep-chart-box">
             <div className="rep-chart-header">
               <h2>Personel Ciro Katkısı</h2>
             </div>
             <div className="rep-chart-body">
               <ResponsiveContainer width="100%" height={260}>
                 <BarChart data={reportData.staffData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="4 4" stroke="#374151" horizontal={false} />
                   <XAxis type="number" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                   <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} width={80} tickLine={false} axisLine={false} />
                   <Tooltip cursor={{fill: '#1f2937'}} content={<CustomTooltip />} />
                   <Bar dataKey="ciro" name="Ciro" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>

        </div>
      ) : (
        <div className="rep-empty-state">
           <FiFileText className="empty-icon" />
           <h3>Veri Bulunamadı</h3>
           <p>Seçtiğiniz ay için herhangi bir randevu hareketi kaydedilmemiş.</p>
        </div>
      )}
    </div>
  );
};

export default Reports;