import React, { useState } from "react";

const TrackComplaint = ({ onNavigate = () => { } }) => {
    const [refId, setRefId] = useState("");
    const [status, setStatus] = useState(null);

    const lookupStatus = (e) => {
        e.preventDefault();
        if (!refId.trim()) {
            setStatus({ type: "error", message: "Please enter a valid complaint reference id." });
            return;
        }
        setStatus({
            type: "success",
            message: "In Progress",
            details: {
                id: refId,
                registeredOn: "2024-10-05",
                stage: "Field Verification",
                expectedResolution: "2-3 days",
            },
        });
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 p-6 md:p-12">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-primary/10 p-6 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-primary">Track Your Complaint</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Enter your complaint reference number to get updates.</p>
                    </div>
                    <button
                        onClick={() => onNavigate("home")}
                        className="px-4 py-2 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/10"
                    >
                        Back to Home
                    </button>
                </div>

                <form onSubmit={lookupStatus} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 mb-6">
                    <input
                        value={refId}
                        onChange={(e) => setRefId(e.target.value)}
                        placeholder="Complaint Reference ID"
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                    <button type="submit" className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90">
                        Check Status
                    </button>
                </form>

                {status && (
                    <div
                        className={`rounded-lg p-4 mb-6 ${status.type === "success"
                                ? "bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700"
                                : "bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700"
                            }`}
                    >
                        <p className="font-semibold">{status.type === "success" ? "Status Found" : "Error"}</p>
                        <p className="mt-2">{status.message}</p>
                        {status.details && (
                            <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                                <p><strong>Ref ID:</strong> {status.details.id}</p>
                                <p><strong>Registered:</strong> {status.details.registeredOn}</p>
                                <p><strong>Current Stage:</strong> {status.details.stage}</p>
                                <p><strong>Expected Resolution:</strong> {status.details.expectedResolution}</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-xl">
                        <h3 className="font-semibold mb-2">Help Desk</h3>
                        <p>Call: 1800-123-4567</p>
                        <p>Email: support@complaintsetu.gov</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                        <h3 className="font-semibold mb-2">Service</h3>
                        <p>Regular updates are sent via SMS and email.</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                        <h3 className="font-semibold mb-2">Timelines</h3>
                        <p>Field verification: 1-2 days</p>
                        <p>Final resolution: 3-5 days</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackComplaint;
