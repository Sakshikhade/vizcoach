import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';
import { Dashboard } from 'components';
import {
  Activities,
  AddActivity,
  AddGroup,
  AddUnit,
  Chat,
  EditActivity,
  EditUnit,
  Groups,
  Login,
  NotFound,
  OrchestrationView,
  Perform,
  Students,
  StudentSubmissions,
  Submissions,
  Units,
  ViewUnit,
} from 'pages';
import {
  activitiesLoader,
  activityLoader,
  editActivityLoader,
  groupsLoader,
  studentsLoader,
  studentSubmissionsLoader,
  submissionLoader,
  submissionsLoader,
  unitLoader,
} from 'db';
import { AuthenticatedRoute } from './AuthenticatedRoute';
import { AuthorizedRoute } from './AuthorizedRoute';

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
            path: 'add-activity',
            element: (
              <AuthorizedRoute
                navigateTo="/dashboard"
                allowedRoles={['Teacher']}
              >
                <AddActivity />
              </AuthorizedRoute>
            ),
            loader: groupsLoader,
          },
          {
            path: ':activityId/units',
            element: <Units />,
            loader: submissionsLoader,
          },
          {
            path: ':activityId/add-unit',
            element: (
              <AuthorizedRoute
                navigateTo="/dashboard"
                allowedRoles={['Teacher']}
              >
                <AddUnit />
              </AuthorizedRoute>
            ),
            loader: activityLoader,
          },
          {
            path: ':activityId/edit-activity',
            element: (
              <AuthorizedRoute
                navigateTo="/dashboard"
                allowedRoles={['Teacher']}
              >
                <EditActivity />
              </AuthorizedRoute>
            ),
            loader: editActivityLoader,
          },
          {
            path: ':activityId/units/:unitId/view',
            element: (
              <AuthorizedRoute
                navigateTo="/dashboard"
                allowedRoles={['Teacher']}
              >
                <ViewUnit />
              </AuthorizedRoute>
            ),
            loader: unitLoader,
          },
          {
            path: ':activityId/units/:unitId/edit-unit',
            element: (
              <AuthorizedRoute
                navigateTo="/dashboard"
                allowedRoles={['Teacher']}
              >
                <EditUnit />
              </AuthorizedRoute>
            ),
            loader: unitLoader,
          },
          {
            path: ':activityId/units/:unitId/perform',
            element: (
              <AuthorizedRoute
                navigateTo="/dashboard"
                allowedRoles={['Student']}
              >
                <Perform />
              </AuthorizedRoute>
            ),
            loader: submissionLoader,
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
            path: ':activityId/submissions/:studentId',
            element: (
              <AuthorizedRoute
                navigateTo="/dashboard"
                allowedRoles={['Teacher']}
              >
                <StudentSubmissions />
              </AuthorizedRoute>
            ),
            loader: studentSubmissionsLoader,
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
            path: 'add-group',
            element: <AddGroup />,
          },
          {
            path: ':groupId',
            element: <Students />,
            loader: studentsLoader,
          },
        ],
      },
      {
        path: 'chat',
        element: <Chat />,
      },
      {
        path: 'orchestration',
        element: (
          <AuthorizedRoute navigateTo="/dashboard" allowedRoles={['Teacher']}>
            <OrchestrationView />
          </AuthorizedRoute>
        ),
        loader: async () => {
          const [activities, groups] = await Promise.all([
            activitiesLoader(),
            groupsLoader(),
          ]);
          return { activities, groups };
        },
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
