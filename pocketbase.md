# Pocketbase Setup Steps

Follow these steps to setup Pocketbase database for the application.

1. Download Pocketbase's executable file from the [official website](https://pocketbase.io/docs/). Run the executable using `./pocketbase serve` command. Ensure that you allow necessary permissions to run the executable per your OS.
2. Add a new field called `role` to the default `users` collection of type `Select`. This field should be set to `non-empty` and `single-valued`. Values for the select `Teacher` and `Student`.
3. Update the `View rule` in the `API Rules` for the `users` collection to `id = @request.auth.id || @request.auth.role = 'Teacher'`. This step will ensure that teachers can view student's records, apart from the requesting user.
4. Create a new collection called `groups`. This collection will store all student groups.
5. Add fields `semester`, `year`, and `course` to the `groups` collection.
6. The field `semester` in the `groups` collection is of type `Select`. This field should be set to `non-empty` and `single-valued`. Values for the select `Fall`, `Spring`, and `Summer`.
7. The field `year` in the `groups` collection is of type `Number`. This field should be set to `non-zero` and `no-decimal`. Values should be between `2000` and `2100`.
8. The field `course` in the `groups` collection is of type `Select`. This field should be set to `non-empty` and `single-valued`. Values for the select `CSE578`.
9. Update the `List/Search Rule` and `View rule` in the `API Rules` for the `groups` collection to `@request.auth.role = 'Teacher'`. This step will ensure that only teachers can view student groups.
10. Create a new collection called `usergroups`. This collection will store the relationship between `users` and `groups`.
11. Add fields `userId` and `groupId` to the `usergroups` collection.
12. The field `userId` in the `usergroups` collection is of type `Relation`. This field should be set to `non-empty` and `single-valued`. Values for this field maps to the `users` collection.
13. The field `groupId` in the `usergroups` collection is of type `Relation`. This field should be set to `non-empty` and `single-valued`. Values for this field maps to the `groups` collection.
14. Add an unique constraint on fields `userId` and `groupId`, ensuring one user belongs to one group.
15. Update the `List/Search Rule` in the `API Rules` for the `usergroups` collection to `@request.auth.role = 'Teacher'`. This step will ensure that only teachers can query `usergroups` collection.
