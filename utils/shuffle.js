export const shuffle = (users) => {
	return users.sort(() => Math.random() - 0.5)
}