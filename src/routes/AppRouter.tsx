import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';
import {
  Activities,
  Dashboard,
  Groups,
  Login,
  NotFound,
  Students,
} from 'pages';
import { AuthenticatedRoute } from './AuthenticatedRoute';
import { AuthorizedRoute } from './AuthorizedRoute';
import { groupsLoader, studentsLoader } from 'db';

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
        element: <Activities />,
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
            loader: ({ params }) => studentsLoader(params.groupId || ''),
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
