import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api.js";
import QuizCard from "../components/quiz/QuizCard.jsx";
import Loader from "../components/common/Loader.jsx";
import {
  GraduationCap,
  Trophy,
  ShieldCheck,
  Flame,
  BookOpen,
  Users,
  Compass,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
const LandingPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchFeaturedQuizzes = async () => {
      try {
        const response = await API.get("/quizzes");
        if (response.data.success) {
          {
            /* Slice top 3 for teaser preview */
          }
          setQuizzes(response.data.quizzes.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching featured quizzes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedQuizzes();
  }, []);
  const stats = [
    { label: "Registered Candidates", value: "12,400+", icon: Users },
    { label: "Active Assessments", value: "450+", icon: BookOpen },
    { label: "Verified Certificates", value: "8,900+", icon: Trophy },
  ];
  const features = [
    {
      title: "Adaptive Exam Engine",
      description:
        "Resilient timed quiz interface with local state caching, negative markings, and auto-submit features.",
      icon: GraduationCap,
    },
    {
      title: "Real-Time Leaderboards",
      description:
        "Websocket-driven ranking feeds. Witness score boards recalculate instantly on candidate submissions.",
      icon: Flame,
    },
    {
      title: "Verified Anti-Cheating",
      description:
        "Tab-focus trackers check candidates switching tabs or leaving screen regions during evaluation.",
      icon: ShieldCheck,
    },
  ];
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden transition-colors">
      {" "}
      {/* Hero Section */}{" "}
      <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8">
        {" "}
        <div className="mx-auto max-w-7xl">
          {" "}
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            {" "}
            {/* Text Area */}{" "}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left"
            >
              {" "}
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary backdrop-blur-md border border-primary/20">
                {" "}
                <Compass className="h-3.5 w-3.5" /> Empowering Digital Learning
                & Evaluation{" "}
              </span>{" "}
              <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-800 leading-[1.1]">
                {" "}
                Evaluate Developer Skills <br className="hidden sm:inline" />{" "}
                With <span className="text-gradient">QuizRise</span>{" "}
              </h1>{" "}
              <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-slate-500">
                {" "}
                A high-fidelity timed testing platform featuring real-time
                ranking leaderboards, granular admin analytics, and CSV bulk
                uploader. Perfect for colleges, companies, and developer
                evaluations.{" "}
              </p>{" "}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                {" "}
                <Link
                  to="/register"
                  className="rounded-xl bg-primary hover:bg-primary-container px-8 py-4 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {" "}
                  Create Student Account <ArrowRight className="h-5 w-5" />{" "}
                </Link>{" "}
                <Link
                  to="/login"
                  className="rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm px-8 py-4 text-sm font-bold text-slate-700 hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
                >
                  {" "}
                  Teacher Access Dashboard{" "}
                </Link>{" "}
              </div>{" "}
            </motion.div>{" "}
            {/* Graphics Area */}{" "}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 relative flex justify-center"
            >
              {" "}
              <div className="relative w-full max-w-sm rounded-3xl bg-surface-container-lowest border border-outline-variant shadow-sm p-6">
                {" "}
                <div className="flex items-center gap-3">
                  {" "}
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white">
                    {" "}
                    <Trophy className="h-4.5 w-4.5" />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h3 className="text-sm font-bold text-slate-800">
                      Global Leaderboard
                    </h3>{" "}
                    <p className="text-[10px] text-slate-400">
                      Updates live via WebSockets
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="mt-5 space-y-2.5">
                  {" "}
                  {[
                    {
                      name: "Sarah Connor",
                      score: "240 pts",
                      rate: "98% pass rate",
                      rank: 1,
                      color: "bg-amber-100 text-amber-700",
                    },
                    {
                      name: "John Doe",
                      score: "215 pts",
                      rate: "94% pass rate",
                      rank: 2,
                      color: "bg-slate-100 text-slate-700",
                    },
                    {
                      name: "Alex Mercer",
                      score: "198 pts",
                      rate: "90% pass rate",
                      rank: 3,
                      color: "bg-orange-100 text-orange-700",
                    },
                  ].map((lead) => (
                    <div
                      key={lead.rank}
                      className="flex items-center justify-between rounded-xl bg-slate-50/80 p-3"
                    >
                      {" "}
                      <div className="flex items-center gap-2.5">
                        {" "}
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold ${lead.color}`}
                        >
                          {" "}
                          {lead.rank}{" "}
                        </span>{" "}
                        <div>
                          {" "}
                          <div className="text-xs font-semibold text-slate-700">
                            {lead.name}
                          </div>{" "}
                          <div className="text-[9px] text-slate-400">
                            {lead.rate}
                          </div>{" "}
                        </div>{" "}
                      </div>{" "}
                      <span className="font-mono text-xs font-bold text-primary">
                        {lead.score}
                      </span>{" "}
                    </div>
                  ))}{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* KPI Stats Grid */}{" "}
      <section className="py-8 bg-slate-100/40 border-b border-slate-200/50">
        {" "}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {" "}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-3"
          >
            {" "}
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-2xl focus-container p-6 transition-all hover:scale-105 duration-300"
                >
                  {" "}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {" "}
                    <Icon className="h-6 w-6" />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <div className="font-display text-2xl font-bold text-slate-800">
                      {stat.value}
                    </div>{" "}
                    <div className="text-xs font-medium text-slate-500">
                      {stat.label}
                    </div>{" "}
                  </div>{" "}
                </div>
              );
            })}{" "}
          </motion.div>{" "}
        </div>{" "}
      </section>{" "}
      {/* Feature Showcase Grid */}{" "}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        {" "}
        <div className="mx-auto max-w-7xl">
          {" "}
          <div className="text-center">
            {" "}
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-800">
              {" "}
              Why Professionals Choose QuizRise{" "}
            </h2>{" "}
            <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              {" "}
              Engineered with modern technologies to assure authentic, smooth,
              and robust evaluations.{" "}
            </p>{" "}
          </div>{" "}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {" "}
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm"
                >
                  {" "}
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {" "}
                    <Icon className="h-5 w-5" />{" "}
                  </div>{" "}
                  <h3 className="mt-5 font-display text-base font-bold text-slate-800">
                    {" "}
                    {feature.title}{" "}
                  </h3>{" "}
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {" "}
                    {feature.description}{" "}
                  </p>{" "}
                </div>
              );
            })}{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* Featured Quizzes Teaser */}{" "}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-150">
        {" "}
        <div className="mx-auto max-w-7xl">
          {" "}
          <div className="flex items-end justify-between">
            {" "}
            <div>
              {" "}
              <h2 className="font-display text-2xl font-bold text-slate-800">
                {" "}
                Trending Assessments{" "}
              </h2>{" "}
              <p className="mt-1 text-xs text-slate-400">
                {" "}
                Attempt these default seeded quizzes to preview the engine.{" "}
              </p>{" "}
            </div>{" "}
            <Link
              to="/register"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              {" "}
              Browse All <ArrowRight className="h-3.5 w-3.5" />{" "}
            </Link>{" "}
          </div>{" "}
          {loading ? (
            <div className="mt-12 flex h-48 items-center justify-center">
              {" "}
              <Loader size="lg" />{" "}
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {" "}
              {quizzes.length > 0 ? (
                quizzes.map((quiz) => <QuizCard key={quiz._id} quiz={quiz} />)
              ) : (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                  {" "}
                  No published assessments found in database. Sign in as admin
                  to configure.{" "}
                </div>
              )}{" "}
            </div>
          )}{" "}
        </div>{" "}
      </section>{" "}
      {/* CTA Bottom Section */}{" "}
      <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
        {" "}
        <div className="mx-auto max-w-3xl rounded-3xl bg-primary p-8 sm:p-12 shadow-lg shadow-primary/20 text-white">
          {" "}
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            {" "}
            Ready to test your abilities?{" "}
          </h2>{" "}
          <p className="mt-3 text-xs sm:text-sm text-white/80 leading-relaxed max-w-md mx-auto">
            {" "}
            Create an account, join the lobby, and attempt assessments to test
            your scores against global developers.{" "}
          </p>{" "}
          <div className="mt-8 flex justify-center">
            {" "}
            <Link
              to="/register"
              className="rounded-xl bg-white px-6 py-3.5 text-xs font-bold text-primary shadow-md hover:bg-slate-50 transition-all"
            >
              {" "}
              Get Started for Free{" "}
            </Link>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
    </div>
  );
};
export default LandingPage;
