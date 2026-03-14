import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
function LocationMarker({ setCoords }) {
    const [position, setPosition] = useState(null);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });

    return position ? <Marker position={position} /> : null;
}
const RegisterComplaint = () => {
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [details, setDetails] = useState("");
    const [file, setFile] = useState(null);
    const [coords, setCoords] = useState({ lat: null, lng: null });

    // file change handler
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ lat: latitude, lng: longitude });

                try {
                    // Reverse geocoding API
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    );
                    const data = await res.json();

                    const area =
                        data.address.suburb ||
                        data.address.village ||
                        data.address.town ||
                        data.address.city ||
                        "";

                    const city =
                        data.address.city ||
                        data.address.state_district ||
                        data.address.state ||
                        "";

                    const locationName = `${area}, ${city}`;

                    setLocation(locationName);
                } catch (err) {
                    console.error(err);
                    setLocation(`Lat: ${latitude}, Lng: ${longitude}`);
                }
            },
            (error) => {
                console.error(error);
                alert("Unable to retrieve your location");
            }
        );
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        const formData = new FormData();

        formData.append("category", category);
        formData.append("location", location);
        formData.append("details", details);
        formData.append("file", file);

        try {

            const res = await fetch("http://localhost:5000/api/complaints", {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            alert(data.message);

        } catch (error) {

            console.error(error);
            alert("Error submitting complaint");

        }

    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col">

            {/* Navbar */}
            <header className="sticky top-0 z-50 border-b bg-white dark:bg-slate-900 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl">
                        account_balance
                    </span>
                    <h1 className="font-bold text-lg">Complaint Setu</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <div className="w-9 h-9 bg-blue-100 text-blue-700 flex items-center justify-center rounded-full font-bold">
                        JD
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className="flex flex-1 max-w-7xl mx-auto w-full gap-8 p-8">

                {/* Sidebar */}
                <aside className="w-60 flex flex-col gap-2">
                    <button className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg">
                        <span className="material-symbols-outlined text-sm">edit_note</span>
                        New Complaint
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined text-sm">home</span>
                        Dashboard
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined text-sm">list_alt</span>
                        My Complaints
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined text-sm">person</span>
                        Profile Settings
                    </div>
                    <div className="border-t my-3"></div>
                    <div className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Logout
                    </div>
                </aside>

                {/* Complaint Form */}
                <div className="flex-1 max-w-xl">
                    <h1 className="text-2xl font-bold mb-1">Register a Complaint</h1>
                    <p className="text-sm text-slate-500 mb-6">
                        Provide accurate details to help resolve the issue efficiently.
                    </p>

                    <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-sm">
                        <form className="p-6 space-y-5" onSubmit={handleSubmit}>

                            {/* Category */}
                            <div>
                                <label className="text-sm font-semibold">Select Category</label>
                                <select
                                    className="w-full mt-2 border rounded-lg px-3 py-2"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                >
                                    <option value="">Choose a category</option>
                                    <option>Water Issues</option>
                                    <option>Electricity</option>
                                    <option>Roads & Potholes</option>
                                    <option>Sanitation</option>
                                    <option>Street Lights</option>
                                </select>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="text-sm font-semibold">Location</label>
                                <input
                                    type="text"
                                    placeholder="Enter area name or landmark"
                                    className="w-full mt-2 border rounded-lg px-3 py-2"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="text-xs text-blue-600 mt-2 flex items-center gap-1"
                                    onClick={handleUseCurrentLocation} // <-- added handler
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        my_location
                                    </span>
                                    Use Current Location
                                </button>
                            </div>

                            {/* Details */}
                            <div>
                                <label className="text-sm font-semibold">Complaint Details</label>
                                <textarea
                                    rows="4"
                                    placeholder="Describe the issue..."
                                    className="w-full mt-2 border rounded-lg px-3 py-2"
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Upload & Map */}
                            <div>
                                <label className="text-sm font-semibold">Upload Photo/Video</label>
                                <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center text-sm text-slate-500 relative">
                                    {file ? (
                                        <div>
                                            Selected File: <strong>{file.name}</strong>
                                        </div>
                                    ) : (
                                        <div>
                                            Click below to upload
                                            <div className="text-xs mt-1">PNG, JPG or MP4 (MAX 10MB)</div>
                                        </div>
                                    )}

                                    {/* File input with separate button */}
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,video/mp4"
                                        className="mt-2"
                                        id="file-upload"
                                        onChange={(e) => {
                                            const selectedFile = e.target.files[0];
                                            setFile(selectedFile);
                                        }}
                                    />
                                    {file && (
                                        <p className="text-sm text-green-600 mt-1">
                                            Selected: {file.name}
                                        </p>
                                    )}
                                    
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold">Pin on Map</label>

                                <MapContainer
                                    center={coords.lat ? [coords.lat, coords.lng] : [23.2599, 77.4126]}
                                    zoom={13}
                                    style={{ height: "200px", width: "100%" }}
                                >
                                    <TileLayer
                                        attribution="&copy; OpenStreetMap contributors"
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    {coords.lat && (
                                        <Marker position={[coords.lat, coords.lng]} />
                                    )}

                                </MapContainer>

                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-700 text-white py-3 rounded-lg font-semibold"
                                >
                                    Submit Complaint
                                </button>
                                <button
                                    type="button"
                                    className="px-6 py-3 bg-slate-100 rounded-lg"
                                    onClick={() => { setCategory(""); setLocation(""); setDetails(""); }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Sidebar */}
                <aside className="w-72 flex flex-col gap-5">
                    <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
                        <h3 className="font-semibold text-blue-700 mb-2">Helpful Tip</h3>
                        <p className="text-sm text-slate-600">
                            Adding a clear photo of the issue helps field workers identify
                            the exact location and nature of the problem.
                        </p>
                    </div>
                    <div className="bg-white border rounded-xl p-5">
                        <h3 className="font-semibold mb-3">Typical Timeline</h3>
                        <ul className="space-y-2 text-sm">
                            <li>🟢 Submission — Instant</li>
                            <li>🔵 Verification — 24-48 Hours</li>
                            <li>⚪ Resolution — 3-5 Business Days</li>
                        </ul>
                    </div>
                </aside>
            </main>

            <footer className="text-center text-sm text-slate-500 border-t py-4">
                © 2024 Complaint Setu - Government Citizens Connect Portal
            </footer>
        </div>
    );
};

export default RegisterComplaint;