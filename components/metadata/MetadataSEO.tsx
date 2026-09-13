'use client';

import React from 'react';
import { Camera, ShieldCheck, Sparkles, MapPin, Sliders, Layers } from 'lucide-react';

export function MetadataSEO() {
  return (
    <section className="py-12 sm:py-16 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete Guide to Image Metadata</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Inspect EXIF, Camera Hardware &amp; Photo Telemetry Online
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            Everything you need to know about reading embedded photographic data, auditing privacy risks, and analyzing technical shooting conditions.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <div className="bg-white dark:bg-[#131722] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Understanding EXIF, IPTC &amp; XMP Standards</span>
            </h3>
            <p>
              When a modern smartphone or DSLR captures an image, it writes metadata headers alongside the compressed pixel data. <strong>EXIF</strong> records technical camera hardware parameters like exposure time, aperture, and ISO sensitivity. <strong>IPTC</strong> stores journalistic descriptions, keywords, and copyright ownership. <strong>XMP</strong> (Extensible Metadata Platform) preserves non-destructive editing history from software like Adobe Lightroom and Photoshop.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131722] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Geotagging &amp; Location Privacy Risks</span>
            </h3>
            <p>
              Smartphones frequently record precise satellite coordinates (latitude, longitude, altitude) whenever location permissions are active for the camera app. While helpful for photo organization, sharing unedited photos on blogs, forums, or classified listings can inadvertently reveal your home address or private whereabouts. ToolNest flags GPS metadata immediately upon upload so you can audit files before distribution.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131722] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Analyzing Photography Telemetry</span>
            </h3>
            <p>
              Reviewing shooting telemetry is invaluable for photographers mastering manual exposure. By comparing shutter speeds (e.g. 1/1000s for sports vs. 1/30s for low light), f-stop apertures (e.g. f/1.8 shallow depth of field vs. f/8 landscape sharpness), and ISO noise thresholds, you can dissect why a photo was sharp, blurred, or underexposed.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131722] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>100% In-Browser Memory Safety</span>
            </h3>
            <p>
              Unlike legacy online EXIF viewers that require transmitting full-resolution photos to remote servers, ToolNest reads binary file headers entirely in your client web browser memory. Your images never touch an external cloud or third-party storage, guaranteeing enterprise-grade confidentiality.
            </p>
          </div>
        </div>

        {/* Common Metadata Tags Reference Table */}
        <div className="bg-white dark:bg-[#131722] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Essential EXIF Metadata Properties Reference
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Key metadata tags commonly recorded by digital cameras and smartphones
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-2.5 px-3">EXIF Tag</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Example Value</th>
                  <th className="py-2.5 px-3">Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white font-mono">Make / Model</td>
                  <td className="py-2.5 px-3">Hardware</td>
                  <td className="py-2.5 px-3 font-mono">Sony ILCE-7M4</td>
                  <td className="py-2.5 px-3">Identifies camera body manufacturer and model</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white font-mono">ExposureTime</td>
                  <td className="py-2.5 px-3">Exposure</td>
                  <td className="py-2.5 px-3 font-mono">1/250 sec</td>
                  <td className="py-2.5 px-3">Duration camera sensor was exposed to light</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white font-mono">FNumber</td>
                  <td className="py-2.5 px-3">Optics</td>
                  <td className="py-2.5 px-3 font-mono">f/2.8</td>
                  <td className="py-2.5 px-3">Lens diaphragm aperture diameter ratio</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white font-mono">ISOSpeedRatings</td>
                  <td className="py-2.5 px-3">Sensor</td>
                  <td className="py-2.5 px-3 font-mono">ISO 400</td>
                  <td className="py-2.5 px-3">Sensor sensitivity amplification level</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white font-mono">FocalLength</td>
                  <td className="py-2.5 px-3">Optics</td>
                  <td className="py-2.5 px-3 font-mono">50.0 mm</td>
                  <td className="py-2.5 px-3">Distance from optical center to focal point</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white font-mono">GPSLatitude / Longitude</td>
                  <td className="py-2.5 px-3">Location</td>
                  <td className="py-2.5 px-3 font-mono">37.7749°, -122.4194°</td>
                  <td className="py-2.5 px-3">Global geographic satellite coordinates</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white font-mono">DateTimeOriginal</td>
                  <td className="py-2.5 px-3">Timestamp</td>
                  <td className="py-2.5 px-3 font-mono">2026:09:10 14:32:05</td>
                  <td className="py-2.5 px-3">Exact local shutter actuation timestamp</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
