"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Receipt, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-slate-900" />
              </div>
              <span className="text-xl font-bold text-slate-900">ReimbursePro</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/signin" 
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Sign in
              </Link>
              <Link href="/signup">
                <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Streamline Your{" "}
              <span className="text-amber-600">Expense Reimbursements</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              A modern, intelligent platform for managing employee expense claims, 
              approvals, and reimbursements with automated workflows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-amber-200"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/signin">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-8 py-6 text-lg rounded-xl"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Why Choose ReimbursePro?
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Everything you need to manage expenses efficiently
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                  <Receipt className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Easy Receipt Upload
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Submit expenses with photo uploads, automatic data extraction, 
                  and smart categorization.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Smart Approvals
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Configurable approval workflows with multi-level hierarchies, 
                  thresholds, and auto-approvals.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Real-time Analytics
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Track spending patterns, monitor budgets, and generate 
                  comprehensive reports instantly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-20 bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Built for Modern Teams
                </h2>
                <ul className="space-y-4">
                  {[
                    "Multi-currency support with automatic conversion",
                    "Role-based access control (Admin, Manager, Finance)",
                    "Automated approval workflows",
                    "Real-time notifications and status tracking",
                    "Export reports to Excel/PDF",
                    "Secure cloud storage for receipts"
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-800 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">500+</div>
                    <div className="text-slate-400">Companies Trust Us</div>
                  </div>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Join hundreds of companies that have streamlined their expense 
                  management process and saved countless hours with ReimbursePro.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 bg-gradient-to-r from-amber-500 to-amber-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Ready to Simplify Expense Management?
            </h2>
            <p className="text-slate-800 mb-8 text-lg">
              Get started in minutes. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-6 text-lg rounded-xl"
                >
                  Create Free Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-slate-50 border-t border-slate-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-slate-900" />
                </div>
                <span className="font-bold text-slate-900">ReimbursePro</span>
              </div>
              <p className="text-slate-500 text-sm">
                © 2024 ReimbursePro. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link href="/signin" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                  Sign In
                </Link>
                <Link href="/signup" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
