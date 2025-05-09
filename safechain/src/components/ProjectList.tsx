import { useEffect, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';

interface Project {
  id: number;
  name: string;
  description: string;
  budget: string;
  spent: string;
  government: string;
  isCompleted: boolean;
  lastUpdated: Date;
}

export const ProjectList = () => {
  const { contract } = useWeb3();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const projectsPerPage = 5;

  const fetchProjects = async (pageNumber: number) => {
    if (!contract) return;

    setLoading(true);
    setError(null);

    try {
      const count = await contract.projectCount();
      const startIndex = (pageNumber - 1) * projectsPerPage;
      const endIndex = Math.min(startIndex + projectsPerPage, count.toNumber());
      const projectsData = [];

      for (let i = startIndex; i < endIndex; i++) {
        const project = await contract.projects(i);
        projectsData.push({
          id: i,
          name: project.name,
          description: project.description,
          budget: ethers.utils.formatEther(project.budget),
          spent: ethers.utils.formatEther(project.spent),
          government: project.government,
          isCompleted: project.isCompleted,
          lastUpdated: new Date(project.lastUpdated.toNumber() * 1000)
        });
      }

      setProjects(projectsData);
      setHasMore(endIndex < count.toNumber());
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      setError(error.message || 'Error fetching projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchProjects(page);
    }
  }, [contract, page]);

  const handleRefresh = () => {
    fetchProjects(page);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setPage(page + 1);
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Projects</h2>
        <button
          onClick={handleRefresh}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          disabled={loading}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No projects found.
        </div>
      ) : (
        <>
          <div className="grid gap-4">
      {projects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
          <h3 className="text-lg font-medium">{project.name}</h3>
                    <p className="text-gray-600 mt-1">{project.description}</p>
            </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
              project.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {project.isCompleted ? 'Completed' : 'In Progress'}
            </span>
          </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Budget:</span>
                    <span className="ml-2 font-medium">{project.budget} ETH</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Spent:</span>
                    <span className="ml-2 font-medium">{project.spent} ETH</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-gray-500">Last Updated:</span>
                    <span className="ml-2">{project.lastUpdated.toLocaleDateString()}</span>
                  </div>
                </div>
        </div>
      ))}
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className={`px-4 py-2 rounded ${
                page === 1 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Previous
            </button>
            <span className="text-gray-600">Page {page}</span>
            <button
              onClick={handleNextPage}
              disabled={!hasMore}
              className={`px-4 py-2 rounded ${
                !hasMore 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};