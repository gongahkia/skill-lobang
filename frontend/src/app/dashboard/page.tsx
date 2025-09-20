'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/ui/Header';
import {
  DollarSign,
  Calendar,
  BookOpen,
  Star,
  AlertCircle,
  TrendingUp,
  Clock,
  MapPin
} from 'lucide-react';
import { SavedCourse, CourseAlert } from '@/types';
import { api, handleApiError } from '@/utils/api';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [savedCourses, setSavedCourses] = useState<SavedCourse[]>([]);
  const [courseAlerts, setCourseAlerts] = useState<CourseAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [savedCoursesRes, alertsRes] = await Promise.all([
        api.get('/users/saved-courses'),
        api.get('/users/course-alerts'),
      ]);

      if (savedCoursesRes.data.success) {
        setSavedCourses(savedCoursesRes.data.data);
      }

      if (alertsRes.data.success) {
        setCourseAlerts(alertsRes.data.data);
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
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

  const getDaysUntilExpiry = () => {
    if (!user?.creditExpiryDate) return null;
    const today = new Date();
    const expiryDate = new Date(user.creditExpiryDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  if (!user) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600">Please log in to view your dashboard.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your SkillsFuture journey
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Credits */}
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Credits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(user.skillsFutureCredits)}
                </p>
              </div>
            </div>
          </div>

          {/* Credit Expiry */}
          <div className="card">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                daysUntilExpiry && daysUntilExpiry <= 30
                  ? 'bg-warning-100'
                  : 'bg-success-100'
              }`}>
                <Calendar className={`h-6 w-6 ${
                  daysUntilExpiry && daysUntilExpiry <= 30
                    ? 'text-warning-600'
                    : 'text-success-600'
                }`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Credits Expiry</p>
                <p className="text-lg font-bold text-gray-900">
                  {daysUntilExpiry ? (
                    daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'
                  ) : (
                    'Not set'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Saved Courses */}
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saved Courses</p>
                <p className="text-2xl font-bold text-gray-900">{savedCourses.length}</p>
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{courseAlerts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Expiry Warning */}
        {daysUntilExpiry && daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-warning-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-warning-800">
                  Credits Expiring Soon!
                </h3>
                <p className="text-sm text-warning-700 mt-1">
                  Your SkillsFuture credits will expire in {daysUntilExpiry} days.
                  Consider booking a course soon to make the most of your credits.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Saved Courses */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Saved Courses</h2>
              <BookOpen className="h-5 w-5 text-gray-400" />
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : savedCourses.length > 0 ? (
              <div className="space-y-4">
                {savedCourses.slice(0, 5).map((savedCourse) => (
                  <div key={savedCourse.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {savedCourse.course.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {savedCourse.course.provider}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {formatPrice(savedCourse.course.priceAfterSubsidy)}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(savedCourse.course.startDate)}
                          </span>
                        </div>
                      </div>
                      <span className={`badge ${
                        savedCourse.priority === 'high' ? 'badge-error' :
                        savedCourse.priority === 'medium' ? 'badge-warning' : 'badge-success'
                      }`}>
                        {savedCourse.priority}
                      </span>
                    </div>
                  </div>
                ))}

                {savedCourses.length > 5 && (
                  <div className="text-center pt-4">
                    <button className="btn btn-outline">
                      View All ({savedCourses.length})
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No saved courses yet</p>
                <p className="text-sm text-gray-500">Start exploring and save courses you're interested in</p>
              </div>
            )}
          </div>

          {/* Course Alerts */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Course Alerts</h2>
              <AlertCircle className="h-5 w-5 text-gray-400" />
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : courseAlerts.length > 0 ? (
              <div className="space-y-4">
                {courseAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {alert.course.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {alert.course.provider}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          Registration deadline: {formatDate(alert.course.registrationDeadline)}
                        </div>
                      </div>
                      <span className={`badge ${
                        alert.alertType === 'registration_deadline' ? 'badge-warning' :
                        alert.alertType === 'seats_available' ? 'badge-success' : 'badge-primary'
                      }`}>
                        {alert.alertType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No active alerts</p>
                <p className="text-sm text-gray-500">Set up alerts to get notified about course updates</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="btn btn-primary">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Courses
            </button>
            <button className="btn btn-outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Update Credits
            </button>
            <button className="btn btn-outline">
              <Star className="h-4 w-4 mr-2" />
              Write Review
            </button>
          </div>
        </div>
      </div>
    </>
  );
}