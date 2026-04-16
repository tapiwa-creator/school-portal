import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <section className="bg-white min-h-screen flex items-center px-5 md:px-8 lg:px-20 py-10">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">

        {/* ── LEFT CONTENT ── */}
        <div className="flex flex-col gap-5 md:gap-6">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-[#22a86a]/40 bg-[#f0faf5] text-[#1a6b43] text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-[#22a86a] animate-pulse" />
            Excellence is our hallmark
          </div>

          {/* Heading */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-black leading-[1.08] text-[#0d2018]">
            The Future of{" "}
            <span className="text-[#22a86a]">Digital Learning</span>{" "}
            &amp; Student Management
          </h1>

          {/* Subtext */}
          <p className="text-[#6b8f7a] text-sm md:text-base leading-relaxed max-w-md font-light">
            Empowering the institution with a modern education management system
            for admissions, online learning, grading, performance tracking, and
            student success.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3 md:gap-4 mt-1 md:mt-2 flex-wrap">
            <Link
              to="/login"
              className="bg-[#0d4a2f] hover:bg-[#1a6b43] text-white text-sm font-semibold px-6 md:px-7 py-3 md:py-3.5 rounded-full flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 transform"
            >
              Log In <span>→</span>
            </Link>
            <Link
              to="/admissions"
              className="border border-gray-300 hover:border-[#22a86a] text-gray-700 hover:text-[#1a6b43] text-sm font-medium px-6 md:px-7 py-3 md:py-3.5 rounded-full transition-all duration-200 hover:bg-[#f0faf5]"
            >
              Admissions
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-0 mt-4 md:mt-6 border-t border-gray-100 pt-5 md:pt-6">
            <div className="pr-5 mr-5 md:pr-8 md:mr-8 border-r border-gray-200">
              <p className="text-2xl md:text-3xl font-black text-[#0d2018] font-serif">10K+</p>
              <p className="text-xs text-[#6b8f7a] mt-1">Students Enrolled</p>
            </div>
            <div className="pr-5 mr-5 md:pr-8 md:mr-8 border-r border-gray-200">
              <p className="text-2xl md:text-3xl font-black text-[#0d2018] font-serif">500+</p>
              <p className="text-xs text-[#6b8f7a] mt-1">Courses Available</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-black text-[#0d2018] font-serif">98%</p>
              <p className="text-xs text-[#6b8f7a] mt-1">Satisfaction Rate</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT IMAGE ── */}
        <div className="relative flex items-center justify-center order-first md:order-last">
          <img
            src="/landing.jpg"
            alt="Education"
            className="w-full rounded-2xl object-cover shadow-2xl max-h-[280px] sm:max-h-[360px] md:max-h-[480px]"
          />
        </div>

      </div>
    </section>
  );
};

export default LandingPage;