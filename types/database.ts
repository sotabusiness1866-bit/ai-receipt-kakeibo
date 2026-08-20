export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number;
          slug: string;
          label: string;
          color: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          slug: string;
          label: string;
          color: string;
          sort_order: number;
          created_at?: string;
        };
        Update: {
          slug?: string;
          label?: string;
          color?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      receipts: {
        Row: {
          id: string;
          user_id: string;
          store_name: string | null;
          purchase_date: string | null;
          total_amount: number;
          category_id: number;
          memo: string | null;
          image_path: string;
          ai_raw_response: unknown | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          store_name?: string | null;
          purchase_date?: string | null;
          total_amount: number;
          category_id: number;
          memo?: string | null;
          image_path: string;
          ai_raw_response?: unknown | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          store_name?: string | null;
          purchase_date?: string | null;
          total_amount?: number;
          category_id?: number;
          memo?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "receipts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
