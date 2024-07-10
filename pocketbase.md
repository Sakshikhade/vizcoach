# Pocketbase Setup Steps

Follow these steps to setup Pocketbase database for the application.

1.  Download Pocketbase's executable file from the [official website](https://pocketbase.io/docs/). Run the executable using `./pocketbase serve` command. Ensure that you allow necessary permissions to run the executable per your OS.
2.  Add a new field called `role` to the default `users` collection of type `Select`. This field should be set to `non-empty` and `single-valued`. Values for the select `Teacher` and `Student`.
3.  Update the `View rule` in the `API Rules` for the `users` collection to `id = @request.auth.id || @request.auth.role = 'Teacher'`. This step will ensure that teachers can view student's records, apart from the requesting user.
4.  Create a new collection called `groups`. This collection will store all student groups.
5.  Add fields `semester`, `year`, and `course` to the `groups` collection.
6.  The field `semester` in the `groups` collection is of type `Select`. This field should be set to `non-empty` and `single-valued`. Values for the select `Fall`, `Spring`, and `Summer`.
7.  The field `year` in the `groups` collection is of type `Number`. This field should be set to `non-zero` and `no-decimal`. Values should be between `2000` and `2100`.
8.  The field `course` in the `groups` collection is of type `Select`. This field should be set to `non-empty` and `single-valued`. Values for the select `CSE578`.
9.  Update the `List/Search Rule` and `View rule` in the `API Rules` for the `groups` collection to the following value. This step will ensure that only teachers and associated students can view student groups.

        // Teachers can access all groups
        @request.auth.role = 'Teacher' ||
        // Students can only access their associated group
        @request.auth.id = @collection.groups.usergroups_via_groupId.userId

10. Create a new collection called `usergroups`. This collection will store the relationship between `users` and `groups`.
11. Add fields `userId` and `groupId` to the `usergroups` collection.
12. The field `userId` in the `usergroups` collection is of type `Relation`. This field should be set to `non-empty` and `single-valued`. Values for this field maps to the `users` collection.
13. The field `groupId` in the `usergroups` collection is of type `Relation`. This field should be set to `non-empty` and `single-valued`. Values for this field maps to the `groups` collection.
14. Add an unique constraint on fields `userId` and `groupId`, ensuring one user belongs to one group.
15. Update the `List/Search Rule` and `View rule` in the `API Rules` for the `usergroups` collection to the following value. This step will ensure that only teachers and associated students can view student groups.

        // Teachers can access all usergroups
        @request.auth.role = 'Teacher' ||
        // Students can only access their associated usergroup
        @request.auth.id = @collection.usergroups.userId

16. Create a new collection called `activities`.
17. Add fields `title`, `description`, `groupId`, and `scheduled` to the `activities` collection.
18. The field `title` in the `activities` collection is of type `Plain Text`. This field should be set to `non-empty`.
19. The field `description` in the `activities` collection is of type `Rich Text`. This field should be set to `non-empty`.
20. The field `groupId` in the `activities` collection is of type `Relation`. This field should be set to `non-empty` and `single-valued`. Values for this field maps to the `groups` collection.
21. The field `scheduled` in the `activities` collection is of type `DateTime`. This field can be empty, meaning activities will post immediately.
22. Update the `List/Search Rule` and `View rule` in the `API Rules` for the `activities` collection to the following value. This step will ensure that only teachers and associated students can view activities.

        // Teacher can access all the activities
        @request.auth.role = 'Teacher' ||
        // Students should have only access if in associated group
        @request.auth.id = @collection.activities.groupId.usergroups_via_groupId.userId

23. Update the `Create rule`, `Update rule`, and `Delete rule` in the `API Rules` for the `activities` collection to the following value. This step will ensure that only teachers can create, update, and delete activities.

        @request.auth.role = 'Teacher'

24. Create a new collection called `units`.
25. Add fields `title`, `description`, `datasets`, `order`, and `activityId` to the `units` collection.
26. The field `title` in the `units` collection is of type `Plain Text`. This field should be set to `non-empty`.
27. The field `description` in the `units` collection is of type `Rich Text`. This field should be set to `non-empty`.
28. The field `datasets` in the `units` collection is of type `File`. This field should be set to `non-empty`, `protected`, and `multi-valued`. Allowed mime types include `text/csv`.
29. The field `order` in the `units` collection is of type `Number`. This field should be set to `non-zero` and `no-decimals`. Values should be between `1` and `5`.
30. The field `activityId` in the `units` collection is of type `Relation`. This field should be set to `non-empty` and `single-valued`. Values for this field maps to the `activities` collection.
31. Update the `List/Search Rule` and `View rule` in the `API Rules` for the `units` collection to the following value. This step will ensure that only teachers and associated students can view activities.

        // Teacher can access all the units
        @request.auth.role = 'Teacher' ||
        // Students should have only access if associated with activity
        @request.auth.id = @collection.units.activityId.groupId.usergroups_via_groupId.userId

32. Create a new collection called `submissions`.
33. Add fields `json`, `unitId`, `userId`, and `state` to the `submissions` collection.
34. The field `json` in the `submissions` collection is of type `JSON`. This field should be set to `non-empty`. Value of this field will store student's Vegalite solution.
35. The field `unitId` in the `submissions` collection is of type `Relation`. This field should be set to `non-empty` and `single-valued`. Values for this field maps to the `units` collection.
36. The field `userId` in the `submissions` collection is of type `Relation`. This field should be set to `non-empty` and `single-valued`. Values for this field maps to the `users` collection.
37. The field `state` in the `submissions` collection is of type `Select`. Values for the select `help` and `submitted`. An `empty` state means that student is working on thier submission.
38. Add an unique constraint on fields `userId` and `unitId`, ensuring one submission per unit per student.
39. Update the `List/Search Rule` and `View rule` in the `API Rules` for the `submissions` collection to the following value. This step will ensure that only teachers and owning students can view submissions.

        // Teacher can access all the submissions
        @request.auth.role = 'Teacher' ||
        // Students should have only access their submissions
        @request.auth.id = @collection.submissions.userId
