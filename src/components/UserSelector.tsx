const UserSelector: React.FC<{
  users: { id: string; email: string }[];
  selectedUser: string;
  onUserChange: (userId: string) => void;
}> = ({ users, selectedUser, onUserChange }) => {
  return (
    <select
      value={selectedUser}
      onChange={(e) => onUserChange(e.target.value)}
      className="form-select block w-full mt-1"
    >
      <option value="" disabled>
        Select a user
      </option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.email}
        </option>
      ))}
    </select>
  );
};
export default UserSelector;
