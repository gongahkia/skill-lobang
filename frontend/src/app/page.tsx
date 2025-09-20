'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import { Search, Filter, Star, Clock, DollarSign, MapPin, Users } from 'lucide-react';
import { Course, SearchFilters } from '@/types';
import { api, handleApiError } from '@/utils/api';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'startDate',
    sortOrder: 'asc',
    limit: 12,
  });

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await api.get(`/courses?${params.toString()}`);

      if (response.data.success) {
        setCourses(response.data.data.data || []);
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, query: searchQuery, page: 1 }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your{' '}
              <span className="text-primary-600">SkillsFuture</span>{' '}
              Journey
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover, compare, and optimize your SkillsFuture credit spending.
              Find the perfect courses that match your goals and budget.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for courses, skills, or providers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-12 h-12 text-base"
                  />
                </div>
                <button type="submit" className="btn btn-primary h-12 px-8">
                  Search
                </button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">500+</div>
                <div className="text-gray-600">Courses Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">50+</div>
                <div className="text-gray-600">Training Providers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">80%</div>
                <div className="text-gray-600">Average Subsidy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">24/7</div>
                <div className="text-gray-600">Course Updates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Courses */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Courses</h2>

            <div className="flex items-center gap-4">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  sortBy: e.target.value as any
                }))}
                className="input w-auto"
              >
                <option value="startDate">Sort by Start Date</option>
                <option value="price">Sort by Price</option>
                <option value="subsidyPercentage">Sort by Subsidy</option>
                <option value="popularity">Sort by Popularity</option>
              </select>

              <button className="btn btn-outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>

          {/* Course Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card loading">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                        {course.title}
                      </h3>
                      <span className="badge badge-primary ml-2">
                        {course.subsidyPercentage}% off
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {course.provider}
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {course.duration} hours • {course.frequency}
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {course.mode === 'online' ? 'Online' : course.location}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-lg font-semibold text-gray-900">
                          {formatPrice(course.priceAfterSubsidy)}
                        </span>
                        {course.priceBeforeSubsidy > course.priceAfterSubsidy && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {formatPrice(course.priceBeforeSubsidy)}
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-gray-600">
                        Starts {formatDate(course.startDate)}
                      </div>
                    </div>

                    {course.availableSeats <= 5 && course.availableSeats > 0 && (
                      <div className="mt-2 text-sm text-warning-600 font-medium">
                        Only {course.availableSeats} seats left!
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No courses found. Try adjusting your search or filters.</p>
            </div>
          )}

          {/* Load More */}
          {!loading && courses.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/courses" className="btn btn-primary btn-lg">
                View All Courses
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}