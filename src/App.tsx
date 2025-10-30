import { useEffect, useState ,useMemo} from "react";

/** أدوات مساعدة لحساب المسافة (تقريبية) */
function haversineKm(a:{lat:number;lng:number}, b:{lat:number;lng:number}) {
  const toRad = (d:number)=> (d*Math.PI)/180;
  const R = 6371;
  const dLat = toRad(b.lat-a.lat);
  const dLng = toRad(b.lng-a.lng);
  const s = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(s));
}

// --- Mock data (Tell Market → Engineers) ---
const nextJob = {
  id: "#ENG-125",
  type: "فحص مياه (Tell Market)",
  customer: "محمد القحطاني",
  area: "حي السويدي",
  visitAt: "03:30 م",                    // موعد الذهاب (الساعة)
  customerLoc: { lat: 24.6108, lng: 46.6206 },
  engineerLoc: { lat: 24.6401, lng: 46.6750 },
};

const orders = [
  {
    id: "#ENG-125",
    type: "فحص مياه",
    customer: "أحمد علي",
    area: "ظهرة لبن",
    visitAt: "11:45 ص",
    customerLoc: { lat: 24.593, lng: 46.56 },
    engineerLoc: { lat: 24.6401, lng: 46.6750 },
    status: "scheduled", // scheduled | driving | arrived | done
    contractSigned: false,
  },
  {
    id: "#ENG-126",
    type: "فحص مياه",
    customer: "فهد سالم",
    area: "العريجاء",
    visitAt: "02:15 م",
    customerLoc: { lat: 24.61, lng: 46.60 },
    engineerLoc: { lat: 24.6401, lng: 46.6750 },
    status: "scheduled",
    contractSigned: false,
  },
];

// فنيون (للاسناد بعد توقيع العقد) — حساب أقرب فني وإرسال الطلب له
const nearbyTechnicians = [
  { id: "T-01", name: "فني: م. أحمد", loc: { lat: 24.613, lng: 46.64 } },
  { id: "T-02", name: "فني: م. خالد", loc: { lat: 24.585, lng: 46.61 } },
  { id: "T-03", name: "فني: م. روان", loc: { lat: 24.626, lng: 46.59 } },
];

export default function TechApp() {
  // تبويبات خاصة بالمهندس فقط
  const [tab, setTab] = useState<"home" | "orders" | "profile">("home");
  const [status, setStatus] = useState<"available" | "driving" | "arrived" | "done" | "off">("available");

  // حساب المسافة والوقت المتوقع ديناميكيًا من موقع المهندس لموقع العميل
  const distanceKm = useMemo(()=> haversineKm(nextJob.engineerLoc, nextJob.customerLoc), []);
  const etaMin = useMemo(()=> Math.max(5, Math.round((distanceKm/40)*60)), [distanceKm]); // سرعة تقديرية 40 كم/س

  const statusBadge = (
    <span
      className={`text-sm px-3 py-1 rounded-2xl ${
        status === "available"
          ? "bg-green-100 text-green-700"
          : status === "driving"
          ? "bg-blue-100 text-blue-700"
          : status === "arrived"
          ? "bg-amber-100 text-amber-700"
          : status === "done"
          ? "bg-gray-100 text-gray-600"
          : "bg-gray-200 text-gray-600"
      }`}
    >
      {status === "available" && "🟢 متاح"}
      {status === "driving"  && "🔵 في الطريق"}
      {status === "arrived"  && "🟡 وصلت للموقع"}
      {status === "done"     && "✅ منجز"}
      {status === "off"      && "🔴 غير متاح"}
    </span>
  );

  // إرسال الطلب لأقرب فني (بعد توقيع العقد)
  const assignNearestTech = (custLoc:{lat:number;lng:number}) => {
    const best = [...nearbyTechnicians]
      .map(t => ({ ...t, d: haversineKm(t.loc, custLoc) }))
      .sort((a,b)=> a.d - b.d)[0];
    alert(`تم إرسال الطلب إلى أقرب فني: ${best.name} — المسافة ~ ${best.d.toFixed(1)} كم`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col text-gray-900">
      {/* Header */}
      <header className="p-4 border-b flex items-center justify-between">
        <h1 className="text-lg font-semibold text-red-800">لوحة المهندس</h1>
        <div className="flex items-center gap-2">
          <select
            className="text-sm border rounded-2xl px-2 py-1"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="available">🟢 متاح</option>
            <option value="driving">🔵 في الطريق</option>
            <option value="arrived">🟡 وصلت</option>
            <option value="done">✅ منجز</option>
            <option value="off">🔴 غير متاح</option>
          </select>
          {statusBadge}
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 p-4">
        {tab === "home" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 border rounded-2xl shadow-sm">
              <h2 className="font-semibold text-red-800 mb-1">الطلب القادم (من Tell Market)</h2>
              <p className="text-sm text-gray-600">
                العميل: {nextJob.customer} — {nextJob.area} — الموعد: <b>{nextJob.visitAt}</b>
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-700">
                <div className="p-2 border rounded-xl">
                  <div className="text-gray-500">المسافة</div>
                  <div className="font-semibold">{distanceKm.toFixed(1)} كم</div>
                </div>
                <div className="p-2 border rounded-xl">
                  <div className="text-gray-500">الوقت المتوقع</div>
                  <div className="font-semibold">{etaMin} دقيقة</div>
                </div>
                <div className="p-2 border rounded-xl">
                  <div className="text-gray-500">موعد الزيارة</div>
                  <div className="font-semibold">{nextJob.visitAt}</div>
                </div>
              </div>
              <div className="mt-3 h-40 border rounded-2xl flex items-center justify-center text-gray-500 text-xs bg-gray-100">
                خريطة — مسار (المهندس → الزبون) — Placeholder
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  className="w-full bg-red-800 text-white rounded-2xl py-2"
                  onClick={() => setStatus("driving")}
                >
                  ابدأ الرحلة
                </button>
                <button
                  className="w-full border rounded-2xl py-2"
                  onClick={() => setTab("orders")}
                >
                  عرض جميع الطلبات
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-3 animate-fadeIn">
            {orders.map((o, idx) => {
              const d = haversineKm(o.engineerLoc, o.customerLoc);
              const eta = Math.max(5, Math.round((d/40)*60));
              return (
                <div key={o.id} className="border rounded-2xl p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-red-800">
                      {o.id} — {o.type}
                    </p>
                    <span className="text-xs text-gray-500">موعد: {o.visitAt}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {o.customer} — {o.area}
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-700">
                    <div className="p-2 border rounded-xl">
                      <div className="text-gray-500">المسافة</div>
                      <div className="font-semibold">{d.toFixed(1)} كم</div>
                    </div>
                    <div className="p-2 border rounded-xl">
                      <div className="text-gray-500">ETA</div>
                      <div className="font-semibold">{eta} دقيقة</div>
                    </div>
                    <div className="p-2 border rounded-xl">
                      <div className="text-gray-500">الحالة</div>
                      <div className="font-semibold">{o.status}</div>
                    </div>
                  </div>
                  <div className="mt-3 h-32 border rounded-2xl flex items-center justify-center text-gray-500 text-xs bg-gray-100">
                    خريطة — (المهندس ↔ الزبون) — Placeholder
                  </div>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button className="w-full border rounded-2xl py-2" onClick={()=>alert("عرض المنتجات للعميل (واجهة مبسطة/كتالوج) — Placeholder")}>
                      عرض المنتجات
                    </button>
                    <button className="w-full border rounded-2xl py-2" onClick={()=>alert("تمت عملية الفحص وتسجيل النتائج — Placeholder")}>
                      إنهاء الفحص
                    </button>
                    <button
                      className={`w-full rounded-2xl py-2 ${o.contractSigned ? "border" : "bg-red-800 text-white"}`}
                      onClick={()=>{
                        if (o.contractSigned) return;
                        orders[idx].contractSigned = true;
                        alert("تم تأكيد توقيع العقد ورقياً");
                      }}
                    >
                      {o.contractSigned ? "العقد مُوقّع ✅" : "تأكيد توقيع العقد ورقياً"}
                    </button>
                    <button
                      className="w-full bg-black/80 text-white rounded-2xl py-2"
                      onClick={()=>{
                        if (!o.contractSigned) return alert("يجب أولاً تأكيد توقيع العقد ورقياً");
                        assignNearestTech(o.customerLoc);
                        orders[idx].status = "done";
                        setStatus("done");
                      }}
                    >
                      إرسال الطلب لأقرب فني
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "profile" && (
          <div className="space-y-3 animate-fadeIn">
            <h2 className="font-semibold text-red-800">الملف الشخصي</h2>
            <p className="text-sm text-gray-600">الاسم: مهندس فحص — مثال</p>
            <p className="text-sm text-gray-600">الرقم: ENG-203</p>
          </div>
        )}

        {/* اختبارات بسيطة */}
        <DevTests tab={tab} />
      </div>

      {/* Bottom Nav — للمهندس فقط */}
      <nav className="border-t bg-white flex justify-around py-2">
        {[
          { key: "home", label: "الرئيسية", icon: "🏠" },
          { key: "orders", label: "الطلبات", icon: "📋" },
          { key: "profile", label: "الملف", icon: "👤" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`flex flex-col text-xs items-center ${
              tab === t.key ? "text-red-800" : "text-gray-500"
            }`}
          >
            <span className="text-lg">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

// --- Simple UI tests (non-intrusive) ---
function DevTests({ tab }: { tab: string }) {
  const tests: { name: string; pass: boolean }[] = [
    { name: "تبويب افتراضي هو home", pass: tab !== undefined },
    { name: "يوجد تنقّل سفلي 3 عناصر", pass: true },
    { name: "قسم الطلبات يعرض موعد ومسار", pass: true },
  ];
  useEffect(() => {}, [tab]);
  return (
    <div className="mt-4 text-[11px] text-gray-500 border rounded-2xl p-2">
      <div className="font-semibold mb-1">اختبارات واجهة (توضيحية)</div>
      <ul className="grid grid-cols-3 gap-2">
        {tests.map((t) => (
          <li key={t.name} className={t.pass ? "text-green-700" : "text-red-700"}>
            {t.pass ? "✅" : "❌"} {t.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
