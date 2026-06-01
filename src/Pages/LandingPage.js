import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const imgRef = useRef(null);

  useEffect(() => {
    const els = document.querySelectorAll(".cs-reveal");
    els.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(18px)";
      el.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
      requestAnimationFrame(() => {
        setTimeout(() => {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }, 60);
      });
    });

    const onScroll = () => {
      if (imgRef.current) {
        imgRef.current.style.transform = `scale(1.04) translateY(${window.scrollY * 0.05}px)`;
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="bg-[#f7f9f7] flex flex-col md:flex-row" style={{ minHeight: "calc(100vh - 116px)" }}>

      {/* ── LEFT HALF ── */}
      <div className="w-full md:w-1/2 flex flex-col justify-between px-8 sm:px-10 lg:px-14 xl:px-16 py-10 md:py-12 relative">

        {/* Decorative circles */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[#22a86a]/6 pointer-events-none" />
        <div className="absolute bottom-16 -left-8 w-28 h-28 rounded-full bg-[#0d4a2f]/5 pointer-events-none" />

        {/* Top section */}
        <div className="flex flex-col gap-4 relative z-10">

          {/* Badge */}
          <div className="cs-reveal inline-flex items-center gap-2 border border-[#22a86a]/40 text-[#1a6b3c] text-[10px] font-semibold px-3 py-1.5 rounded-full w-fit tracking-widest uppercase bg-white shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22a86a] flex-shrink-0" />
            Excellence is our hallmark
          </div>

          {/* Heading */}
          <h1 className="cs-reveal font-serif text-3xl sm:text-4xl lg:text-[42px] xl:text-5xl font-black leading-[1.08] text-[#0d2018] tracking-tight">
            The Future of{" "}
            <em className="not-italic text-[#22a86a]">Digital<br />Learning</em>{" "}
            &amp; Student<br />Management
          </h1>

          {/* Subtext */}
          <p className="cs-reveal text-[#6b8f7a] text-sm lg:text-base leading-relaxed max-w-sm font-light">
            Empowering the institution with a modern education management system
            for admissions, online learning, grading, performance tracking, and
            student success.
          </p>

          {/* CTA Buttons */}
          <div className="cs-reveal flex items-center gap-3 flex-wrap mt-1">
            <Link
              to="/login"
              className="group bg-[#0d4a2f] hover:bg-[#1a6b43] text-white text-xs font-semibold px-5 py-2.5 rounded-full flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 transform"
            >
              Log In
              <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">→</span>
            </Link>
            <Link
              to="/admissions"
              className="border-2 border-[#0d4a2f]/20 hover:border-[#22a86a] text-[#0d4a2f] hover:text-[#1a6b43] text-xs font-semibold px-5 py-2.5 rounded-full transition-all duration-200 hover:bg-[#f0faf5] bg-white shadow-sm"
            >
              Admissions
            </Link>
          </div>
        </div>


        

        {/* Stats */}
        <div className="cs-reveal flex items-stretch gap-0 mt-8 md:mt-0 pt-6 border-t border-[#0d4a2f]/10">
          {[
            { num: "100+", label: "Students Enrolled" },
            { num: "5+", label: "Subjects Available" },
            { num: "100%",  label: "Satisfaction Rate"  },
          ].map((s, i) => (
            <div key={i} className={`flex-1 ${i < 2 ? "border-r border-[#0d4a2f]/10 pr-3 mr-3" : ""}`}>
              <p className="text-2xl lg:text-3xl font-black text-[#0d2018] font-serif leading-none">{s.num}</p>
              <p className="text-[11px] text-[#6b8f7a] mt-1 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT HALF — image with padding so it doesn't touch edges ── */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-5 md:p-6 lg:p-8">
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl" style={{ minHeight: "260px" }}>

          {/* Image */}
          <img
            ref={imgRef}
            src="/landing.jpg"
            alt="Education"
            className="absolute inset-0 w-full h-full object-cover scale-[1.04]"
            style={{ transformOrigin: "center center" }}
          />



        </div>
      </div>

    </section>
  );
};

export default LandingPage;