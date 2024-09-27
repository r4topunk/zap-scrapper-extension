import { useEffect, useState } from "react";

interface Report {
  _id: string;
  phone: string;
  countReports: number;
}

function App() {
  const [reports, setReports] = useState<Report[]>([]);

  const anonymizePhoneNumber = (phone: string) => {
    return phone.replace(/^(\d{2})(\d{4})(\d{4,})$/, "$1****$3");
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        "https://ruxintel.r4topunk.xyz/service-crud/blocklist"
      );
      const data = await res.json();
      if (data?.status_code == 200 && data?.data?.dados?.length > 0) {
        const updatedReports = data.data.dados.map((report: Report) => ({
          ...report,
          phone: anonymizePhoneNumber(report.phone),
        }));
        setReports(updatedReports);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full min-h-screen bg-black py-4 bg-app flex justify-center">
      <div className="container text-[#3DF64F] border border-[#3DF64F] p-4 flex flex-col items-center justify-center">
        <a href="https://ruxintel.r4topunk.xyz" target="_blank">
          <h1 className="text-4xl font-bold ">Ruxintel</h1>
        </a>
        <h2 className="text-xl font-medium mb-6">Blocklist</h2>

        {reports ? (
          <>
            <table>
              <thead className="border border-[#3DF64F]">
                <tr>
                  <th className="border border-[#3DF64F] py-1 px-4">count</th>
                  <th className="border border-[#3DF64F] py-1 px-4">phone</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => {
                  return (
                    <tr key={index}>
                      <td className="border border-[#3DF64F] py-1 px-4">
                        {report.countReports}
                      </td>
                      <td className="border border-[#3DF64F] py-1 px-4">
                        {report.phone}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        ) : null}
        <p className="text-sm mt-8">
          A melhor plataforma contra fraudes de contato direto.
        </p>
        <a href="https://ruxintel.r4topunk.xyz" className="text-sm font-bold">
          Proteja-se com a Ruxintel.
        </a>
      </div>
    </div>
  );
}

export default App;
