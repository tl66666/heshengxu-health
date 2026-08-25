export function planPresentation(tasks: Array<{ status: string }>) {
  const completedCount = tasks.filter((task) => task.status === 'completed').length;
  return {
    completedCount,
    showCompleteArt: tasks.length > 0 && completedCount === tasks.length,
  };
}
