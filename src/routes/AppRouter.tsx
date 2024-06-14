import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';
import {
  Activities,
  Dashboard,
  Groups,
  Login,
  NotFound,
  Students,
  Submissions,
  UnitPage,
  Units,
} from 'pages';
import { AuthenticatedRoute } from './AuthenticatedRoute';
import { AuthorizedRoute } from './AuthorizedRoute';
import {
  activitiesLoader,
  groupsLoader,
  studentsLoader,
  submissionsLoader,
  unitLoader,
  unitsLoader,
} from 'db';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: (
      <AuthenticatedRoute>
        <Dashboard />
      </AuthenticatedRoute>
    ),
    children: [
      {
        path: 'activities',
        children: [
          {
            path: '',
            element: <Activities />,
            loader: activitiesLoader,
          },
          {
            path: ':activityId/units',
            element: (
              <AuthorizedRoute
                navigateTo="/dashboard"
                allowedRoles={['Teacher']}
              >
                <Units />
              </AuthorizedRoute>
            ),
            loader: unitsLoader,
          },
          {
            path: ':activityId/units/:unitId',
            element: (
              <AuthorizedRoute
                navigateTo="/dashboard"
                allowedRoles={['Teacher']}
              >
                <UnitPage />
              </AuthorizedRoute>
            ),
            loader: unitLoader,
          },
          {
            path: ':activityId/submissions',
            element: (
              <AuthorizedRoute
                navigateTo="/dashboard"
                allowedRoles={['Teacher']}
              >
                <Submissions />
              </AuthorizedRoute>
            ),
            loader: submissionsLoader,
          },
          {
            path: '*',
            element: <Navigate to="/dashboard" />,
          },
        ],
      },
      {
        path: 'groups',
        element: (
          <AuthorizedRoute navigateTo="/dashboard" allowedRoles={['Teacher']}>
            <Outlet />
          </AuthorizedRoute>
        ),
        children: [
          {
            path: '',
            element: <Groups />,
            loader: groupsLoader,
          },
          {
            path: ':groupId',
            element: <Students />,
            loader: studentsLoader,
          },
        ],
      },
      {
        path: '',
        element: <Navigate to="activities" replace={true} />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace={true} />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
