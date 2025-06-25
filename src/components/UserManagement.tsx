/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Edit as EditIcon,
    FilterList as FilterIcon,
    Person as PersonIcon,
    Search as SearchIcon,
    Upload as UploadIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    Switch,
    TextField,
    Toolbar,
    Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    DataGrid,
    GridActionsCellItem,
    GridColDef,
    GridRowId,
    GridToolbar
} from '@mui/x-data-grid';
import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    GROUP_COLORS,
    GROUP_DISPLAY_NAMES,
    GROUP_TO_CATEGORY,
    Group,
    User,
    UserCategory,
    getCategoryPrice
} from '../types';
import { exportUsersCSV } from '../utils/csvExport';

interface UserFormData {
    name: string;
    group: Group;
    trialUser: boolean;
    price: number;
    notes?: string;
    category: UserCategory;
    displayNumber: number;
}

interface UserManagementProps {
    users: User[];
    onUpdateUsers: (users: User[]) => void;
    onBack?: () => void;
}

interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

interface UserStats {
    totalUsers: number;
    activeUsers: number;
    trialUsers: number;
    paidUsers: number;
    byGroup: Record<Group, number>;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onUpdateUsers, onBack }) => {
    // State management
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<Group | ''>('');
    const [showInactive, setShowInactive] = useState(false);
    const [selectedRows, setSelectedRows] = useState<GridRowId[]>([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' });
    const [loading, setLoading] = useState(false);
    const [bulkActionDialog, setBulkActionDialog] = useState({ open: false, action: '' });

    // Form management
    const { handleSubmit, control, setValue, reset, formState: { errors } } = useForm<UserFormData>({
        defaultValues: {
            name: '',
            group: 'グループB',
            trialUser: false,
            price: 0,
            notes: '',
            category: 'B型',
            displayNumber: 1
        }
    });

    // User statistics
    const userStats: UserStats = useMemo(() => {
        const stats: UserStats = {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.isActive !== false).length,
            trialUsers: users.filter(u => u.trialUser).length,
            paidUsers: users.filter(u => !u.trialUser).length,
            byGroup: {
                'グループA': 0,
                'グループB': 0,
                'グループC': 0,
                'その他': 0
            }
        };

        users.forEach(user => {
            stats.byGroup[user.group]++;
        });

        return stats;
    }, [users]);

    // Filtered users
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesGroup = selectedGroup === '' || user.group === selectedGroup;
            const matchesActive = showInactive || user.isActive !== false;

            return matchesSearch && matchesGroup && matchesActive;
        });
    }, [users, searchQuery, selectedGroup, showInactive]);

    // Data validation
    const validateUserData = (user: User): ValidationResult => {
        const errors: string[] = [];

        if (!user.name.trim()) {
            errors.push('利用者名は必須です');
        }

        if (user.name.length > 50) {
            errors.push('利用者名は50文字以内で入力してください');
        }

        if (user.price < 0 || user.price > 10000) {
            errors.push('料金は0円から10,000円の範囲で設定してください');
        }

        // Check for duplicate names
        const duplicateUser = users.find(u => u.id !== user.id && u.name.trim() === user.name.trim());
        if (duplicateUser) {
            errors.push('同じ名前の利用者が既に存在します');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    };

    // CRUD Operations
    const handleCreateUser = (data: UserFormData) => {
        const category = GROUP_TO_CATEGORY[data.group];
        const maxDisplayNumber = Math.max(0, ...users.filter(u => u.category === category).map(u => u.displayNumber));

        const newUser: User = {
            id: `user_${Date.now()}`,
            name: data.name.trim(),
            group: data.group,
            trialUser: data.trialUser,
            price: getCategoryPrice(category),
            createdAt: new Date().toISOString(),
            isActive: true,
            notes: data.notes,
            category: category,
            displayNumber: maxDisplayNumber + 1
        };

        const validation = validateUserData(newUser);
        if (!validation.isValid) {
            setSnackbar({
                open: true,
                message: validation.errors.join(', '),
                severity: 'error'
            });
            return;
        }

        const updatedUsers = [...users, newUser];
        onUpdateUsers(updatedUsers);

        setSnackbar({
            open: true,
            message: `利用者「${newUser.name}」を登録しました`,
            severity: 'success'
        });

        handleCloseDialog();
    };

    const handleUpdateUser = (data: UserFormData) => {
        if (!editingUser) return;

        const category = GROUP_TO_CATEGORY[data.group];

        const updatedUser: User = {
            ...editingUser,
            name: data.name.trim(),
            group: data.group,
            trialUser: data.trialUser,
            price: getCategoryPrice(category),
            notes: data.notes,
            category: category
        };

        const validation = validateUserData(updatedUser);
        if (!validation.isValid) {
            setSnackbar({
                open: true,
                message: validation.errors.join(', '),
                severity: 'error'
            });
            return;
        }

        const updatedUsers = users.map(user =>
            user.id === editingUser.id ? updatedUser : user
        );
        onUpdateUsers(updatedUsers);

        setSnackbar({
            open: true,
            message: `利用者「${updatedUser.name}」を更新しました`,
            severity: 'success'
        });

        handleCloseDialog();
    };

    const handleDeleteUser = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        if (window.confirm(`利用者「${user.name}」を削除しますか？\nこの操作は取り消せません。`)) {
            const updatedUsers = users.filter(u => u.id !== userId);
            onUpdateUsers(updatedUsers);

            setSnackbar({
                open: true,
                message: `利用者「${user.name}」を削除しました`,
                severity: 'success'
            });
        }
    };

    const handleToggleUserStatus = (userId: string) => {
        const updatedUsers = users.map(user =>
            user.id === userId ? { ...user, isActive: !user.isActive } : user
        );
        onUpdateUsers(updatedUsers);

        const user = users.find(u => u.id === userId);
        const status = user?.isActive ? '無効' : '有効';
        setSnackbar({
            open: true,
            message: `利用者「${user?.name}」を${status}にしました`,
            severity: 'info'
        });
    };

    // Dialog handlers
    const handleOpenDialog = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setValue('name', user.name);
            setValue('group', user.group);
            setValue('trialUser', user.trialUser);
            setValue('price', user.price);
            setValue('notes', user.notes || '');
            setValue('category', user.category);
            setValue('displayNumber', user.displayNumber);
        } else {
            setEditingUser(null);
            reset();
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
        reset();
    };

    // Bulk operations
    const handleBulkAction = (action: string) => {
        if (selectedRows.length === 0) {
            setSnackbar({
                open: true,
                message: '操作する利用者を選択してください',
                severity: 'info'
            });
            return;
        }

        setBulkActionDialog({ open: true, action });
    };

    const executeBulkAction = () => {
        const selectedUsers = users.filter(user => selectedRows.includes(user.id));
        let updatedUsers = [...users];

        switch (bulkActionDialog.action) {
            case 'activate':
                updatedUsers = users.map(user =>
                    selectedRows.includes(user.id) ? { ...user, isActive: true } : user
                );
                setSnackbar({
                    open: true,
                    message: `${selectedUsers.length}名の利用者を有効にしました`,
                    severity: 'success'
                });
                break;

            case 'deactivate':
                updatedUsers = users.map(user =>
                    selectedRows.includes(user.id) ? { ...user, isActive: false } : user
                );
                setSnackbar({
                    open: true,
                    message: `${selectedUsers.length}名の利用者を無効にしました`,
                    severity: 'success'
                });
                break;

            case 'delete':
                if (window.confirm(`選択した${selectedUsers.length}名の利用者を削除しますか？\nこの操作は取り消せません。`)) {
                    updatedUsers = users.filter(user => !selectedRows.includes(user.id));
                    setSnackbar({
                        open: true,
                        message: `${selectedUsers.length}名の利用者を削除しました`,
                        severity: 'success'
                    });
                } else {
                    setBulkActionDialog({ open: false, action: '' });
                    return;
                }
                break;

            case 'changePaidStatus':
                updatedUsers = users.map(user =>
                    selectedRows.includes(user.id) ? { ...user, trialUser: false } : user
                );
                setSnackbar({
                    open: true,
                    message: `${selectedUsers.length}名の利用者を有料ユーザーに変更しました`,
                    severity: 'success'
                });
                break;
        }

        onUpdateUsers(updatedUsers);
        setSelectedRows([]);
        setBulkActionDialog({ open: false, action: '' });
    };

    // Export/Import functions
    const handleExportUsers = () => {
        try {
            exportUsersCSV(filteredUsers.length > 0 ? filteredUsers : users);
            setSnackbar({
                open: true,
                message: '利用者データをCSVファイルとしてダウンロードしました',
                severity: 'success'
            });
        } catch (error) {
            console.error('CSV出力エラー:', error);
            setSnackbar({
                open: true,
                message: 'CSV出力中にエラーが発生しました',
                severity: 'error'
            });
        }
    };

    const handleImportUsers = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const csv = e.target?.result as string;
                const lines = csv.split('\n');
                const headers = lines[0].split(',');

                const importedUsers: User[] = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',');
                    if (values.length >= 7) {
                        const user: User = {
                            id: `imported_${Date.now()}_${i}`,
                            name: values[1].replace(/"/g, '').trim(),
                            group: values[2] as Group,
                            trialUser: values[3] === 'はい',
                            price: parseInt(values[4]) || 400,
                            createdAt: new Date().toISOString(),
                            isActive: values[6] === '有効',
                            notes: values[7]?.replace(/"/g, '') || '',
                            category: values[2] as UserCategory,
                            displayNumber: parseInt(values[5]) || 1
                        };

                        const validation = validateUserData(user);
                        if (validation.isValid) {
                            importedUsers.push(user);
                        }
                    }
                }

                if (importedUsers.length > 0) {
                    const updatedUsers = [...users, ...importedUsers];
                    onUpdateUsers(updatedUsers);

                    setSnackbar({
                        open: true,
                        message: `${importedUsers.length}名の利用者をインポートしました`,
                        severity: 'success'
                    });
                }
            } catch (error) {
                setSnackbar({
                    open: true,
                    message: 'CSVファイルの読み込みに失敗しました',
                    severity: 'error'
                });
            }
        };
        reader.readAsText(file);

        // Reset file input
        event.target.value = '';
    };

    // DataGrid columns
    const columns: GridColDef[] = [
        {
            field: 'avatar',
            headerName: '',
            width: 80,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Avatar sx={{ width: 32, height: 32, bgcolor: params.row.isActive === false ? 'grey.400' : 'primary.main' }}>
                    <PersonIcon fontSize="small" />
                </Avatar>
            )
        },
        {
            field: 'name',
            headerName: '利用者名',
            width: 200,
            editable: true,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{
                        textDecoration: params.row.isActive === false ? 'line-through' : 'none',
                        color: params.row.isActive === false ? 'text.disabled' : 'text.primary'
                    }}>
                        {params.value}
                    </Typography>
                    {params.row.trialUser && (
                        <Chip label="お試し" size="small" color="warning" />
                    )}
                </Box>
            )
        },
        {
            field: 'group',
            headerName: 'グループ',
            width: 120,
            editable: true,
            renderCell: (params) => (
                <Chip
                    label={GROUP_DISPLAY_NAMES[params.value as Group]}
                    size="small"
                    variant="outlined"
                    sx={{
                        borderColor: GROUP_COLORS[params.value as Group],
                        color: GROUP_COLORS[params.value as Group],
                        fontWeight: 'bold',
                        backgroundColor: alpha(GROUP_COLORS[params.value as Group], 0.1)
                    }}
                />
            )
        },
        {
            field: 'price',
            headerName: '料金',
            width: 100,
            editable: true,
            renderCell: (params) => (
                <Typography variant="body2" color={params.row.isActive === false ? 'text.disabled' : 'text.primary'}>
                    ¥{params.value.toLocaleString()}
                </Typography>
            )
        },
        {
            field: 'createdAt',
            headerName: '登録日',
            width: 120,
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary">
                    {new Date(params.value).toLocaleDateString('ja-JP')}
                </Typography>
            )
        },
        {
            field: 'isActive',
            headerName: '状態',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value !== false ? '有効' : '無効'}
                    size="small"
                    color={params.value !== false ? 'success' : 'default'}
                />
            )
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: '操作',
            width: 150,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="編集"
                    onClick={() => handleOpenDialog(params.row)}
                />,
                <GridActionsCellItem
                    icon={params.row.isActive !== false ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    label={params.row.isActive !== false ? '無効化' : '有効化'}
                    onClick={() => handleToggleUserStatus(params.row.id)}
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="削除"
                    onClick={() => handleDeleteUser(params.row.id)}
                />
            ]
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    👥 利用者管理
                </Typography>
                {onBack && (
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={onBack}
                        size="large"
                        sx={{ minHeight: '50px', fontSize: '1.1rem' }}
                    >
                        管理画面に戻る
                    </Button>
                )}
            </Box>

            {/* Statistics Cards */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">{userStats.totalUsers}</Typography>
                            <Typography variant="body2" color="text.secondary">総利用者数</Typography>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main">{userStats.activeUsers}</Typography>
                            <Typography variant="body2" color="text.secondary">有効利用者</Typography>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="warning.main">{userStats.trialUsers}</Typography>
                            <Typography variant="body2" color="text.secondary">体験利用者</Typography>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="info.main">{userStats.paidUsers}</Typography>
                            <Typography variant="body2" color="text.secondary">有料利用者</Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* Toolbar */}
            <Toolbar sx={{ px: '0 !important', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
                    {/* Search */}
                    <TextField
                        size="small"
                        placeholder="利用者名で検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                        sx={{ minWidth: 200 }}
                    />

                    {/* Group Filter */}
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>グループ</InputLabel>
                        <Select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value as Group | '')}
                            label="グループ"
                            startAdornment={<FilterIcon sx={{ mr: 1, color: 'action.active' }} />}
                        >
                            <MenuItem value="">すべて</MenuItem>
                            <MenuItem value="グループA">A型利用者</MenuItem>
                            <MenuItem value="グループB">B型利用者</MenuItem>
                            <MenuItem value="グループC">職員</MenuItem>
                            <MenuItem value="グループD">体験利用者</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Show Inactive */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showInactive}
                                onChange={(e) => setShowInactive(e.target.checked)}
                                size="small"
                            />
                        }
                        label="無効ユーザーも表示"
                    />

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Action Buttons */}
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        size="small"
                    >
                        新規登録
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportUsers}
                        size="small"
                    >
                        エクスポート
                    </Button>

                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleImportUsers}
                        style={{ display: 'none' }}
                        id="import-users-input"
                    />
                    <label htmlFor="import-users-input">
                        <Button
                            variant="outlined"
                            startIcon={<UploadIcon />}
                            component="span"
                            size="small"
                        >
                            インポート
                        </Button>
                    </label>
                </Box>
            </Toolbar>

            {/* Selected Actions */}
            {selectedRows.length > 0 && (
                <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                        {selectedRows.length}名の利用者が選択されています
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button size="small" onClick={() => handleBulkAction('activate')}>
                            一括有効化
                        </Button>
                        <Button size="small" onClick={() => handleBulkAction('deactivate')}>
                            一括無効化
                        </Button>
                        <Button size="small" onClick={() => handleBulkAction('changePaidStatus')}>
                            有料ユーザーに変更
                        </Button>
                        <Button size="small" color="error" onClick={() => handleBulkAction('delete')}>
                            一括削除
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Data Grid */}
            <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={filteredUsers}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 25 },
                        },
                    }}
                    pageSizeOptions={[25, 50, 100]}
                    checkboxSelection
                    disableRowSelectionOnClick
                    loading={loading}
                    onRowSelectionModelChange={(newSelection: any) => {
                        setSelectedRows(newSelection);
                    }}
                    slots={{
                        toolbar: GridToolbar
                    }}
                    sx={{
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: 'action.hover'
                        }
                    }}
                />
            </Box>

            {/* User Form Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit(editingUser ? handleUpdateUser : handleCreateUser)}>
                    <DialogTitle>
                        {editingUser ? '利用者情報編集' : '新規利用者登録'}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: '利用者名は必須です' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="利用者名"
                                        error={!!errors.name}
                                        helperText={errors.name?.message}
                                        autoFocus
                                        fullWidth
                                    />
                                )}
                            />

                            <Controller
                                name="group"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth>
                                        <InputLabel>グループ</InputLabel>
                                        <Select {...field} label="グループ">
                                            <MenuItem value="グループA">A型利用者</MenuItem>
                                            <MenuItem value="グループB">B型利用者</MenuItem>
                                            <MenuItem value="グループC">職員</MenuItem>
                                            <MenuItem value="グループD">体験利用者</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />

                            <Controller
                                name="price"
                                control={control}
                                rules={{
                                    required: '料金は必須です',
                                    min: { value: 0, message: '料金は0円以上で設定してください' },
                                    max: { value: 10000, message: '料金は10,000円以下で設定してください' }
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="料金"
                                        type="number"
                                        error={!!errors.price}
                                        helperText={errors.price?.message}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">¥</InputAdornment>
                                        }}
                                        fullWidth
                                    />
                                )}
                            />

                            <Controller
                                name="trialUser"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={<Switch {...field} checked={field.value} />}
                                        label="お試しユーザー"
                                    />
                                )}
                            />

                            <Controller
                                name="notes"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="備考"
                                        multiline
                                        rows={3}
                                        fullWidth
                                    />
                                )}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>キャンセル</Button>
                        <Button type="submit" variant="contained">
                            {editingUser ? '更新' : '登録'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Bulk Action Confirmation Dialog */}
            <Dialog open={bulkActionDialog.open} onClose={() => setBulkActionDialog({ open: false, action: '' })}>
                <DialogTitle>一括操作の確認</DialogTitle>
                <DialogContent>
                    <Typography>
                        選択した{selectedRows.length}名の利用者に対して以下の操作を実行しますか？
                    </Typography>
                    <Typography sx={{ mt: 1, fontWeight: 'bold' }}>
                        {bulkActionDialog.action === 'activate' && '一括有効化'}
                        {bulkActionDialog.action === 'deactivate' && '一括無効化'}
                        {bulkActionDialog.action === 'delete' && '一括削除（取り消せません）'}
                        {bulkActionDialog.action === 'changePaidStatus' && '有料ユーザーへの変更'}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBulkActionDialog({ open: false, action: '' })}>
                        キャンセル
                    </Button>
                    <Button
                        onClick={executeBulkAction}
                        variant="contained"
                        color={bulkActionDialog.action === 'delete' ? 'error' : 'primary'}
                    >
                        実行
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UserManagement; 