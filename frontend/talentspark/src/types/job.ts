interface Job {
    id: number;
    title: string;
    description?: string;
    salary: number;
    company_id: number;
}

type JobPayload = Omit<Job, "id">;

export type { Job, JobPayload }