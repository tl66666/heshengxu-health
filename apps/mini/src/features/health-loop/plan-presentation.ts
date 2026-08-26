export function planPresentation(tasks: Array<{ status: string }>) {
  const completedCount = tasks.filter((task) => task.status === 'completed').length;
  return {
    completedCount,
    showCompleteArt: tasks.length > 0 && completedCount === tasks.length,
  };
}

export function planPageState(plan: { id: string } | null, loadError: string, loading = false) {
  if (loading) return 'loading';
  if (loadError) return 'error';
  return plan ? 'active' : 'empty';
}
